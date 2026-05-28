import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { DoctorProfile } from './entities/doctor.entity';
import { DoctorSchedule } from './entities/schedule-slot.entity';
import { MedicalRecord } from './entities/consultation-note.entity';
import { Prescription } from './entities/prescription.entity';
import { Appointment } from '../patient/entities/appointment.entity';
import { PatientProfile } from '../patient/entities/patient.entity';
import { Notification } from '../patient/entities/notification.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DoctorProfile,
      DoctorSchedule,
      MedicalRecord,
      Prescription,
      Appointment,
      PatientProfile,
      Notification,
    ]),
    NotificationsModule,
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
  exports: [DoctorService, TypeOrmModule],
})
export class DoctorModule {}
