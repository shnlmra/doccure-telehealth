import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { PatientProfile } from '../patient/entities/patient.entity';
import { DoctorProfile } from '../doctor/entities/doctor.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production';

  constructor(
    private usersService: UsersService,

    @InjectRepository(PatientProfile)
    private patientProfileRepository: Repository<PatientProfile>,

    @InjectRepository(DoctorProfile)
    private doctorProfileRepository: Repository<DoctorProfile>,
  ) {}

  // Secure lightweight JWT generation in pure Node.js
  generateToken(payload: any): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 24 * 3600 })).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${header}.${body}`)
      .digest('base64url');

    return `${header}.${body}.${signature}`;
  }

  async register(email: string, passwordPlain: string, role: 'patient' | 'doctor' | 'admin'): Promise<any> {
    if (role !== 'patient' && role !== 'doctor') {
      throw new BadRequestException('Role must be either patient or doctor');
    }

    // 1. Create User
    const user = await this.usersService.create(email, passwordPlain, role);

    let profileId = null;

    // 2. If patient, auto-create empty patient_profiles row
    if (role === 'patient') {
      const patientProfile = this.patientProfileRepository.create({
        userId: user.id,
        name: email.split('@')[0], // default name
      });
      const savedProfile = await this.patientProfileRepository.save(patientProfile);
      profileId = savedProfile.id;
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      profileId,
    };
  }

  async login(email: string, passwordPlain: string): Promise<any> {
    // 1. Fetch user with password select
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Compare password hashes
    const inputHash = this.usersService.hashPassword(passwordPlain);
    if (user.password !== inputHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let profileId = null;

    // 3. Fetch related profile ID
    if (user.role === 'patient') {
      const profile = await this.patientProfileRepository.findOne({ where: { userId: user.id } });
      if (profile) profileId = profile.id;
    } else if (user.role === 'doctor') {
      const profile = await this.doctorProfileRepository.findOne({ where: { userId: user.id } });
      if (profile) profileId = profile.id;
    }

    // 4. Generate Token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      profileId,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profileId,
      },
    };
  }
}
