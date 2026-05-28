import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PatientProfile } from './patient.entity';
import { DoctorProfile } from '../../doctor/entities/doctor.entity';
import { DoctorSchedule } from '../../doctor/entities/schedule-slot.entity';
import { MedicalRecord } from '../../doctor/entities/consultation-note.entity';
import { Prescription } from '../../doctor/entities/prescription.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  doctorId: string;

  @Column()
  scheduleId: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'in_session';

  @Column({ nullable: true })
  consultationLink: string;

  @ManyToOne(() => PatientProfile, (patient) => patient.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: PatientProfile;

  @ManyToOne(() => DoctorProfile, (doctor) => doctor.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: DoctorProfile;

  @ManyToOne(() => DoctorSchedule, (schedule) => schedule.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scheduleId' })
  schedule: DoctorSchedule;

  @OneToMany(() => MedicalRecord, (record) => record.appointment)
  medicalRecords: MedicalRecord[];

  @OneToMany(() => Prescription, (prescription) => prescription.appointment)
  prescriptions: Prescription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
