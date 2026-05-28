import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PatientModule } from './modules/patient/patient.module';
import { DoctorModule } from './modules/doctor/doctor.module';

@Module({
  imports: [
    // Load .env variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Connect to PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'db',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USERNAME || 'telehealth_user',
      password: process.env.DATABASE_PASSWORD || 'telehealth_secure_pass_123',
      database: process.env.DATABASE_NAME || 'telehealth_db',
      autoLoadEntities: true,
      synchronize: true, // Only for development; disable in production and use migrations
      logging: false,
    }),

    // Features Modules
    UsersModule,
    AuthModule,
    PatientModule,
    DoctorModule,
  ],
})
export class AppModule {}
