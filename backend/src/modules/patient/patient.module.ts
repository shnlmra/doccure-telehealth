import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PatientProfile } from './entities/patient.entity';
import { Appointment } from './entities/appointment.entity';
import { AiRecommendationLog } from './entities/recommendation.entity';
import { Notification } from './entities/notification.entity';
import { DoctorProfile } from '../doctor/entities/doctor.entity';
import { DoctorSchedule } from '../doctor/entities/schedule-slot.entity';
import { MedicalRecord } from '../doctor/entities/consultation-note.entity';
import { Prescription } from '../doctor/entities/prescription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientProfile,
      Appointment,
      AiRecommendationLog,
      Notification,
      DoctorProfile,
      DoctorSchedule,
      MedicalRecord,
      Prescription,
    ]),
  ],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService, TypeOrmModule],
})
export class PatientModule {}
