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
import { NotificationsGateway } from '../notifications/notifications.gateway';

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

    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  private validateUuid(id: string, name: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      throw new BadRequestException(`Invalid ${name} format. Expected UUID.`);
    }
  }

  async createProfile(userId: string, dto: UpdateDoctorProfileDto): Promise<DoctorProfile> {
    this.validateUuid(userId, 'userId');
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
    this.validateUuid(userId, 'userId');
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
    this.validateUuid(id, 'id');
    const doc = await this.doctorRepository.findOne({ where: { id }, relations: ['schedules'] });
    if (!doc) {
      throw new NotFoundException('Doctor not found');
    }
    return doc;
  }

  async updateSchedule(doctorId: string, dto: CreateDoctorScheduleDto): Promise<any> {
    this.validateUuid(doctorId, 'doctorId');
    // Validate doctorId profile exists
    const doctor = await this.doctorRepository.findOne({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const slotsToSave: { startTime: string; endTime: string }[] = [];

    if (dto.timeSlots && dto.timeSlots.length > 0) {
      for (const slotStr of dto.timeSlots) {
        const parts = slotStr.split(' - ');
        if (parts.length !== 2) {
          throw new BadRequestException(`Invalid timeslot format: ${slotStr}`);
        }
        slotsToSave.push({
          startTime: parts[0].trim(),
          endTime: parts[1].trim(),
        });
      }
    } else if (dto.startTime && dto.endTime) {
      slotsToSave.push({
        startTime: dto.startTime,
        endTime: dto.endTime,
      });
    } else {
      throw new BadRequestException('Either timeSlots or startTime and endTime must be provided.');
    }

    const savedSlots: DoctorSchedule[] = [];

    for (const slot of slotsToSave) {
      const startVal = parseInt(slot.startTime.replace(':', ''), 10);
      const endVal = parseInt(slot.endTime.replace(':', ''), 10);
      if (startVal >= endVal) {
        throw new BadRequestException('Schedule startTime must be earlier than endTime.');
      }

      // 2. Check overlap logic (newStart < existingEnd && newEnd > existingStart)
      const existingSchedules = await this.scheduleRepository.find({ where: { doctorId, date: dto.date } });
      for (const schedule of existingSchedules) {
        const existingStart = parseInt(schedule.startTime.replace(':', ''), 10);
        const existingEnd = parseInt(schedule.endTime.replace(':', ''), 10);

        if (startVal < existingEnd && endVal > existingStart) {
          throw new BadRequestException(`Time slot ${slot.startTime} - ${slot.endTime} overlaps with an existing schedule for this date.`);
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
          throw new BadRequestException(`Time slot ${slot.startTime} - ${slot.endTime} overlaps with an already booked patient appointment.`);
        }
      }

      // 4. Save schedule
      const newSchedule = this.scheduleRepository.create({
        doctorId,
        date: dto.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: true,
      });

      const saved = await this.scheduleRepository.save(newSchedule);
      savedSlots.push(saved);
    }

    this.notificationsGateway.broadcastScheduleUpdate(doctorId);
    return savedSlots.length === 1 ? savedSlots[0] : savedSlots;
  }

  async deleteSchedule(doctorId: string, scheduleId: string): Promise<void> {
    this.validateUuid(doctorId, 'doctorId');
    this.validateUuid(scheduleId, 'scheduleId');
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, doctorId },
      relations: ['doctor'],
    });
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
        this.notificationsGateway.sendNotification(app.patient.userId, notif);
      }
    }

    // 3. Remove slot
    await this.scheduleRepository.remove(schedule);
    this.notificationsGateway.broadcastScheduleUpdate(doctorId);
  }

  async getSchedule(doctorId: string): Promise<any[]> {
    this.validateUuid(doctorId, 'doctorId');
    const slots = await this.scheduleRepository.find({
      where: { doctorId },
      order: { date: 'ASC', startTime: 'ASC' },
    });
    return slots.map(slot => ({
      id: slot.id,
      doctorId: slot.doctorId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
      timeSlot: `${slot.startTime} - ${slot.endTime}`,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
    }));
  }

  async getPastAppointments(doctorId: string): Promise<Appointment[]> {
    this.validateUuid(doctorId, 'doctorId');
    return this.appointmentRepository.find({
      where: { doctorId, status: 'completed' },
      relations: ['patient'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUpcomingAppointments(doctorId: string): Promise<Appointment[]> {
    this.validateUuid(doctorId, 'doctorId');
    return this.appointmentRepository.find({
      where: [
        { doctorId, status: 'confirmed' },
        { doctorId, status: 'in_session' },
      ],
      relations: ['patient', 'schedule'],
      order: { schedule: { date: 'ASC', startTime: 'ASC' } },
    });
  }

  async getPatientHistory(doctorId: string, patientId: string): Promise<any> {
    this.validateUuid(doctorId, 'doctorId');
    this.validateUuid(patientId, 'patientId');
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
    this.validateUuid(doctorId, 'doctorId');
    if (dto.appointmentId) this.validateUuid(dto.appointmentId, 'appointmentId');
    if (dto.patientId) this.validateUuid(dto.patientId, 'patientId');
    // 1. Retrieve appointment details
    const appointment = await this.appointmentRepository.findOne({
      where: { id: dto.appointmentId, doctorId },
      relations: ['patient', 'doctor'],
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
        message: `Dr. ${appointment.doctor?.name || 'your clinician'} has uploaded new consultation notes and prescriptions. Review under your Medical Records tab.`,
      });
      await this.notificationRepository.save(notif);
      this.notificationsGateway.sendNotification(appointment.patient.userId, notif);
    }

    return this.medicalRecordRepository.findOne({
      where: { id: savedRecord.id },
      relations: ['appointment'],
    });
  }

  async joinSession(doctorId: string, appointmentId: string): Promise<any> {
    this.validateUuid(doctorId, 'doctorId');
    this.validateUuid(appointmentId, 'appointmentId');
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, doctorId },
      relations: ['patient', 'doctor'],
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

    // Send Consultation Session Active notification
    if (appointment.patient && appointment.patient.userId) {
      const notif = this.notificationRepository.create({
        userId: appointment.patient.userId,
        title: 'Consultation Session Active',
        message: `Dr. ${appointment.doctor?.name || 'your clinician'} has joined the consultation session. Click to join the call.`,
      });
      await this.notificationRepository.save(notif);
      this.notificationsGateway.sendNotification(appointment.patient.userId, notif);
    }

    return {
      sessionUrl: appointment.consultationLink,
      status: appointment.status,
    };
  }
}
