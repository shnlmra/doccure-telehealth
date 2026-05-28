import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PatientProfile } from '../patient/entities/patient.entity';
import { DoctorProfile } from '../doctor/entities/doctor.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([PatientProfile, DoctorProfile]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
