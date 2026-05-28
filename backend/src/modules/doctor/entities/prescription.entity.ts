import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Appointment } from '../../patient/entities/appointment.entity';
import { PatientProfile } from '../../patient/entities/patient.entity';
import { DoctorProfile } from './doctor.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  appointmentId: string;

  @Column()
  patientId: string;

  @Column()
  doctorId: string;

  @Column()
  medicationName: string;

  @Column()
  dosage: string;

  @Column({ type: 'text', nullable: true })
  instructions: string; // dosage schedule, directives, etc.

  @ManyToOne(() => Appointment, (app) => app.prescriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @ManyToOne(() => PatientProfile, (p) => p.prescriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: PatientProfile;

  @ManyToOne(() => DoctorProfile, (d) => d.prescriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: DoctorProfile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
