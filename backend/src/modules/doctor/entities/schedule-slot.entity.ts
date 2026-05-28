import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { DoctorProfile } from './doctor.entity';
import { Appointment } from '../../patient/entities/appointment.entity';

@Entity('doctor_schedules')
export class DoctorSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  doctorId: string;

  @Column({ type: 'date' })
  date: string;

  @Column()
  startTime: string; // e.g. "09:00"

  @Column()
  endTime: string; // e.g. "09:30"

  @Column({ default: true })
  isAvailable: boolean;

  @ManyToOne(() => DoctorProfile, (doctor) => doctor.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: DoctorProfile;

  @OneToMany(() => Appointment, (appointment) => appointment.schedule)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
