import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientProfile } from './entities/patient.entity';
import { Appointment } from './entities/appointment.entity';
import { AiRecommendationLog } from './entities/recommendation.entity';
import { Notification } from './entities/notification.entity';
import { DoctorProfile } from '../doctor/entities/doctor.entity';
import { DoctorSchedule } from '../doctor/entities/schedule-slot.entity';
import { MedicalRecord } from '../doctor/entities/consultation-note.entity';
import { Prescription } from '../doctor/entities/prescription.entity';
import { UpdatePatientProfileDto } from './dto/create-patient.dto';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { AskAiDto } from './dto/ask-ai.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(PatientProfile)
    private patientRepository: Repository<PatientProfile>,

    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,

    @InjectRepository(AiRecommendationLog)
    private recommendationRepository: Repository<AiRecommendationLog>,

    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,

    @InjectRepository(DoctorProfile)
    private doctorRepository: Repository<DoctorProfile>,

    @InjectRepository(DoctorSchedule)
    private scheduleRepository: Repository<DoctorSchedule>,

    @InjectRepository(MedicalRecord)
    private medicalRecordRepository: Repository<MedicalRecord>,

    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
  ) {}

  async createProfile(userId: string, dto: UpdatePatientProfileDto): Promise<PatientProfile> {
    let patient = await this.patientRepository.findOne({ where: { userId } });
    if (!patient) {
      patient = this.patientRepository.create({ userId });
    }

    patient.name = dto.name;
    patient.birthday = dto.birthday || patient.birthday;
    patient.weight = dto.weight || patient.weight;
    patient.height = dto.height || patient.height;
    patient.contactNumber = dto.contactNumber || patient.contactNumber;
    patient.medicalHistory = dto.medicalHistory || patient.medicalHistory;
    patient.profilePicture = dto.profilePicture || patient.profilePicture;

    return this.patientRepository.save(patient);
  }

  async getProfile(userId: string): Promise<PatientProfile> {
    const profile = await this.patientRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Patient profile does not exist.');
    }
    return profile;
  }

  async bookAppointment(patientId: string, bookDto: BookAppointmentDto): Promise<Appointment> {
    // 1. Fetch Patient and Doctor profiles
    const patient = await this.patientRepository.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient profile not found');

    const doctor = await this.doctorRepository.findOne({ where: { id: bookDto.doctorId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');

    // Validation: Doctors cannot book their own schedules
    if (patient.userId === doctor.userId) {
      throw new BadRequestException('Clinicians cannot book appointments with themselves.');
    }

    // 2. Fetch slot
    const slot = await this.scheduleRepository.findOne({ where: { id: bookDto.scheduleId, doctorId: bookDto.doctorId } });
    if (!slot) throw new NotFoundException('Schedule slot not found for this doctor');
    
    if (!slot.isAvailable) {
      throw new BadRequestException('Schedule slot is already booked.');
    }

    // 3. Validation: Patient has no overlapping appointments on that date and hour range
    const patientAppointments = await this.appointmentRepository.find({
      where: {
        patientId,
        status: 'confirmed',
        schedule: {
          date: slot.date,
        },
      },
      relations: ['schedule'],
    });

    const newStart = parseInt(slot.startTime.replace(':', ''), 10);
    const newEnd = parseInt(slot.endTime.replace(':', ''), 10);

    for (const app of patientAppointments) {
      if (!app.schedule) continue;
      const appStart = parseInt(app.schedule.startTime.replace(':', ''), 10);
      const appEnd = parseInt(app.schedule.endTime.replace(':', ''), 10);

      if (newStart < appEnd && newEnd > appStart) {
        throw new BadRequestException('You already have a confirmed appointment during this timeslot.');
      }
    }

    // 4. Create appointment
    const appointment = this.appointmentRepository.create({
      patientId,
      doctorId: bookDto.doctorId,
      scheduleId: bookDto.scheduleId,
      status: 'confirmed', // confirm booking
    });

    const savedAppointment = await this.appointmentRepository.save(appointment);

    // 5. Reserve schedule
    slot.isAvailable = false;
    await this.scheduleRepository.save(slot);

    // 6. Send push notification to doctor user ID
    const notif = this.notificationRepository.create({
      userId: doctor.userId,
      title: 'New Appointment Booked',
      message: `Patient ${patient.name || 'someone'} booked a consultation for ${slot.date} at ${slot.startTime} - ${slot.endTime}.`,
    });
    await this.notificationRepository.save(notif);

    return savedAppointment;
  }

  async cancelAppointment(patientId: string, appointmentId: string): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, patientId },
      relations: ['schedule', 'doctor'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      throw new BadRequestException('Cannot cancel a completed or already cancelled appointment.');
    }

    // 1. Free schedule slot
    if (appointment.schedule) {
      appointment.schedule.isAvailable = true;
      await this.scheduleRepository.save(appointment.schedule);
    }

    // 2. Set status to cancelled
    appointment.status = 'cancelled';
    await this.appointmentRepository.save(appointment);

    // 3. Notify doctor
    if (appointment.doctor) {
      const notif = this.notificationRepository.create({
        userId: appointment.doctor.userId,
        title: 'Appointment Cancelled',
        message: `An appointment scheduled for ${appointment.schedule?.date || ''} has been cancelled by the patient.`,
      });
      await this.notificationRepository.save(notif);
    }
  }

  async rescheduleAppointment(patientId: string, appointmentId: string, newScheduleId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, patientId },
      relations: ['schedule', 'doctor', 'patient'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found.');

    // 1. Free old schedule slot
    if (appointment.schedule) {
      appointment.schedule.isAvailable = true;
      await this.scheduleRepository.save(appointment.schedule);
    }

    // 2. Validate and reserve new slot
    const newSlot = await this.scheduleRepository.findOne({ where: { id: newScheduleId, doctorId: appointment.doctorId } });
    if (!newSlot || !newSlot.isAvailable) {
      throw new BadRequestException('Target schedule slot is not available.');
    }

    newSlot.isAvailable = false;
    await this.scheduleRepository.save(newSlot);

    // 3. Update appointment
    appointment.scheduleId = newScheduleId;
    appointment.schedule = newSlot;
    appointment.status = 'confirmed'; // reset to confirmed if cancelled/pending
    const updatedApp = await this.appointmentRepository.save(appointment);

    // 4. Notify doctor
    if (appointment.doctor) {
      const notif = this.notificationRepository.create({
        userId: appointment.doctor.userId,
        title: 'Appointment Rescheduled',
        message: `Patient ${appointment.patient?.name || ''} rescheduled appointment to ${newSlot.date} at ${newSlot.startTime} - ${newSlot.endTime}.`,
      });
      await this.notificationRepository.save(notif);
    }

    return updatedApp;
  }

  async getAppointments(patientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { patientId },
      relations: ['doctor', 'schedule'],
      order: { createdAt: 'DESC' },
    });
  }

  async askAi(patientId: string, askAiDto: AskAiDto): Promise<AiRecommendationLog> {
    // Keyword matching logic
    const symptoms = askAiDto.symptoms.toLowerCase();
    let suggestSpecialization = 'General Physician';
    let relevanceScore = 0.95;

    if (symptoms.includes('chest') || symptoms.includes('heart') || symptoms.includes('breath')) {
      suggestSpecialization = 'Cardiologist';
      relevanceScore = 0.99;
    } else if (symptoms.includes('skin') || symptoms.includes('rash') || symptoms.includes('itch')) {
      suggestSpecialization = 'Dermatologist';
      relevanceScore = 0.98;
    } else if (symptoms.includes('urine') || symptoms.includes('kidney') || symptoms.includes('bladder')) {
      suggestSpecialization = 'Urologist';
      relevanceScore = 0.97;
    } else if (symptoms.includes('child') || symptoms.includes('baby') || symptoms.includes('pediatric')) {
      suggestSpecialization = 'Pediatrician';
      relevanceScore = 0.99;
    }

    // Retrieve active doctors matching specialization
    const matchingDoctors = await this.doctorRepository.find({
      where: { specialization: suggestSpecialization },
    });

    const recommendedDoctorsJSON = matchingDoctors.map((doc) => ({
      doctorId: doc.id,
      name: doc.name,
      specialization: doc.specialization,
      relevanceScore,
    }));

    // Create log in database
    const log = this.recommendationRepository.create({
      patientId,
      symptoms: askAiDto.symptoms,
      recommendedDoctors: recommendedDoctorsJSON,
    });

    return this.recommendationRepository.save(log);
  }

  async getRecommendations(patientId: string): Promise<AiRecommendationLog[]> {
    return this.recommendationRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async readNotification(userId: string, id: string): Promise<Notification> {
    const notif = await this.notificationRepository.findOne({ where: { id, userId } });
    if (!notif) throw new NotFoundException('Notification not found');
    notif.isRead = true;
    return this.notificationRepository.save(notif);
  }

  async getMedicalRecords(patientId: string): Promise<any> {
    // 1. Fetch own medical records
    const medicalRecords = await this.medicalRecordRepository.find({
      where: { patientId },
      relations: ['doctor', 'appointment'],
      order: { createdAt: 'DESC' },
    });

    // 2. Fetch own prescriptions
    const prescriptions = await this.prescriptionRepository.find({
      where: { patientId },
      relations: ['doctor', 'appointment'],
      order: { createdAt: 'DESC' },
    });

    return {
      medicalRecords,
      prescriptions,
    };
  }

  async joinSession(patientId: string, appointmentId: string): Promise<any> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, patientId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Verify appointment is active (confirmed or in_session)
    if (appointment.status !== 'confirmed' && appointment.status !== 'in_session') {
      throw new BadRequestException('Appointment is not active.');
    }

    return {
      sessionUrl: appointment.consultationLink || `https://meet.daily.co/doccure-session-${appointmentId}`,
      status: appointment.status,
    };
  }
}
