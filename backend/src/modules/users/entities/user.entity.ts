import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { PatientProfile } from '../../patient/entities/patient.entity';
import { DoctorProfile } from '../../doctor/entities/doctor.entity';
import { Notification } from '../../patient/entities/notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Hide password by default in queries
  password?: string;

  @Column({ type: 'varchar', default: 'patient' })
  role: 'patient' | 'doctor' | 'admin';

  @OneToOne(() => PatientProfile, (profile) => profile.user, { cascade: true })
  patientProfile?: PatientProfile;

  @OneToOne(() => DoctorProfile, (profile) => profile.user, { cascade: true })
  doctorProfile?: DoctorProfile;

  @OneToMany(() => Notification, (notif) => notif.user)
  notifications: Notification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
