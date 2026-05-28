import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Appointment } from '../../patient/entities/appointment.entity';
import { PatientProfile } from '../../patient/entities/patient.entity';
import { DoctorProfile } from './doctor.entity';

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  appointmentId: string;

  @Column()
  patientId: string;

  @Column()
  doctorId: string;

  @Column({ type: 'text' })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  notes: string; // Used for general notes, clinical summary, follow-up instructions

  @ManyToOne(() => Appointment, (app) => app.medicalRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @ManyToOne(() => PatientProfile, (p) => p.medicalRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: PatientProfile;

  @ManyToOne(() => DoctorProfile, (d) => d.medicalRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: DoctorProfile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
