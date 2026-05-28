import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorProfile } from './entities/doctor.entity';
import { DoctorSchedule } from './entities/schedule-slot.entity';
import { MedicalRecord } from './entities/consultation-note.entity';
import { Prescription } from './entities/prescription.entity';
import { Appointment } from '../patient/entities/appointment.entity';
import { PatientProfile } from '../patient/entities/patient.entity';
import { Notification } from '../patient/entities/notification.entity';
import { UpdateDoctorProfileDto } from './dto/create-doctor.dto';
import { CreateDoctorScheduleDto } from './dto/update-schedule.dto';
import { CreateMedicalRecordDto } from './dto/create-note.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(DoctorProfile)
    private doctorRepository: Repository<DoctorProfile>,

    @InjectRepository(DoctorSchedule)
    private scheduleRepository: Repository<DoctorSchedule>,

    @InjectRepository(MedicalRecord)
    private medicalRecordRepository: Repository<MedicalRecord>,

    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,

    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,

    @InjectRepository(PatientProfile)
    private patientRepository: Repository<PatientProfile>,

    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async createProfile(userId: string, dto: UpdateDoctorProfileDto): Promise<DoctorProfile> {
    // 1. Validate unique license number
    const licenseExists = await this.doctorRepository.findOne({ where: { licenseNumber: dto.licenseNumber } });
    if (licenseExists && licenseExists.userId !== userId) {
      throw new BadRequestException('License number is already registered by another clinician.');
    }

    // 2. Fetch or create doctor profile
    let doctor = await this.doctorRepository.findOne({ where: { userId } });
    if (!doctor) {
      doctor = this.doctorRepository.create({ userId });
    }

    // 3. Update details
    doctor.name = dto.name;
    doctor.specialization = dto.specialization;
    doctor.bio = dto.bio || doctor.bio;
    doctor.profilePicture = dto.profilePicture || doctor.profilePicture;
    doctor.licenseNumber = dto.licenseNumber;

    return this.doctorRepository.save(doctor);
  }

  async getProfile(userId: string): Promise<DoctorProfile> {
    const profile = await this.doctorRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Doctor profile does not exist yet. Please register or update profile.');
    }
    return profile;
  }

  async findAll(): Promise<DoctorProfile[]> {
    return this.doctorRepository.find({
      relations: ['schedules'],
    });
  }

  async findOne(id: string): Promise<DoctorProfile> {
    const doc = await this.doctorRepository.findOne({ where: { id }, relations: ['schedules'] });
    if (!doc) {
      throw new NotFoundException('Doctor not found');
    }
    return doc;
  }

  async updateSchedule(doctorId: string, dto: CreateDoctorScheduleDto): Promise<DoctorSchedule> {
    // Validate doctorId profile exists
    const doctor = await this.doctorRepository.findOne({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    // 1. Time validations
    const startVal = parseInt(dto.startTime.replace(':', ''), 10);
    const endVal = parseInt(dto.endTime.replace(':', ''), 10);
    if (startVal >= endVal) {
      throw new BadRequestException('Schedule startTime must be earlier than endTime.');
    }

    // 2. Check overlap logic (newStart < existingEnd && newEnd > existingStart)
    const existingSchedules = await this.scheduleRepository.find({ where: { doctorId, date: dto.date } });
    for (const schedule of existingSchedules) {
      const existingStart = parseInt(schedule.startTime.replace(':', ''), 10);
      const existingEnd = parseInt(schedule.endTime.replace(':', ''), 10);

      if (startVal < existingEnd && endVal > existingStart) {
        throw new BadRequestException('Time slots overlap with an existing schedule for this date.');
      }
    }

    // 3. Check overlaps with already booked appointments
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        doctorId,
        schedule: {
          date: dto.date,
        },
      },
      relations: ['schedule'],
    });
    for (const app of existingAppointments) {
      if (!app.schedule) continue;
      const appStart = parseInt(app.schedule.startTime.replace(':', ''), 10);
      const appEnd = parseInt(app.schedule.endTime.replace(':', ''), 10);

      if (startVal < appEnd && endVal > appStart) {
        throw new BadRequestException('Time slots overlap with an already booked patient appointment.');
      }
    }

    // 4. Save schedule
    const newSchedule = this.scheduleRepository.create({
      doctorId,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      isAvailable: true,
    });

    return this.scheduleRepository.save(newSchedule);
  }

  async deleteSchedule(doctorId: string, scheduleId: string): Promise<void> {
    const schedule = await this.scheduleRepository.findOne({ where: { id: scheduleId, doctorId } });
    if (!schedule) {
      throw new NotFoundException('Schedule slot not found.');
    }

    // 1. Find if schedule has any active patient bookings
    const appointments = await this.appointmentRepository.find({
      where: { scheduleId, status: 'confirmed' },
      relations: ['patient'],
    });

    // 2. Cancel and notify affected patients
    for (const app of appointments) {
      app.status = 'cancelled';
      await this.appointmentRepository.save(app);

      // Create notification for patient user
      if (app.patient && app.patient.userId) {
        const notif = this.notificationRepository.create({
          userId: app.patient.userId,
          title: 'Appointment Cancelled',
          message: `Your appointment with Dr. ${schedule.doctor?.name || 'your clinician'} has been cancelled because the timeslot was updated.`,
        });
        await this.notificationRepository.save(notif);
      }
    }

    // 3. Remove slot
    await this.scheduleRepository.remove(schedule);
  }

  async getSchedule(doctorId: string): Promise<DoctorSchedule[]> {
    return this.scheduleRepository.find({
      where: { doctorId },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async getPastAppointments(doctorId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { doctorId, status: 'completed' },
      relations: ['patient'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPatientHistory(doctorId: string, patientId: string): Promise<any> {
    // 1. Enforce privacy logic: doctor must have booked appointment history with the patient
    const recordCheck = await this.appointmentRepository.findOne({
      where: [
        { doctorId, patientId, status: 'completed' },
        { doctorId, patientId, status: 'confirmed' },
        { doctorId, patientId, status: 'in_session' },
      ],
    });

    if (!recordCheck) {
      throw new ForbiddenException('Privacy rule violation: Doctors can only view records of patients they have consulted.');
    }

    // 2. Retrieve history
    const medicalRecords = await this.medicalRecordRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });

    const prescriptions = await this.prescriptionRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });

    return {
      medicalRecords,
      prescriptions,
    };
  }

  async addConsultationNote(doctorId: string, dto: CreateMedicalRecordDto): Promise<MedicalRecord> {
    // 1. Retrieve appointment details
    const appointment = await this.appointmentRepository.findOne({
      where: { id: dto.appointmentId, doctorId },
      relations: ['patient'],
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found or not assigned to you.');
    }

    // 2. Update appointment status to completed
    appointment.status = 'completed';
    await this.appointmentRepository.save(appointment);

    // 3. Create medical record
    const record = this.medicalRecordRepository.create({
      appointmentId: dto.appointmentId,
      patientId: dto.patientId,
      doctorId,
      diagnosis: dto.diagnosis,
      notes: dto.notes,
    });
    const savedRecord = await this.medicalRecordRepository.save(record);

    // 4. Save prescriptions
    if (dto.prescriptions && dto.prescriptions.length > 0) {
      const prescriptionEntities = dto.prescriptions.map((p) =>
        this.prescriptionRepository.create({
          appointmentId: dto.appointmentId,
          patientId: dto.patientId,
          doctorId,
          medicationName: p.medicationName,
          dosage: p.dosage,
          instructions: p.instructions,
        }),
      );
      await this.prescriptionRepository.save(prescriptionEntities);
    }

    // 5. Send notification to Patient User ID
    if (appointment.patient && appointment.patient.userId) {
      const notif = this.notificationRepository.create({
        userId: appointment.patient.userId,
        title: 'New Clinical Records Logged',
        message: `Dr. has uploaded new consultation notes and prescriptions. Review under your Medical Records tab.`,
      });
      await this.notificationRepository.save(notif);
    }

    return this.medicalRecordRepository.findOne({
      where: { id: savedRecord.id },
      relations: ['appointment'],
    });
  }

  async joinSession(doctorId: string, appointmentId: string): Promise<any> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, doctorId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Validate appointment time (simplified for dev testability: active or confirmed status required)
    if (appointment.status !== 'confirmed' && appointment.status !== 'in_session') {
      throw new BadRequestException('Appointment is not in confirmed or active state.');
    }

    // Update status to in_session and assign Jitsi/Daily mock URL
    appointment.status = 'in_session';
    appointment.consultationLink = `https://meet.daily.co/doccure-session-${appointmentId}`;
    await this.appointmentRepository.save(appointment);

    return {
      sessionUrl: appointment.consultationLink,
      status: appointment.status,
    };
  }
}
