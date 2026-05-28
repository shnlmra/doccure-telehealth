import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PatientProfile } from './patient.entity';

@Entity('ai_recommendation_logs')
export class AiRecommendationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column({ type: 'text' })
  symptoms: string;

  @Column({ type: 'jsonb', nullable: true })
  recommendedDoctors: any; // List of matched doctor profiles and relevance scores

  @ManyToOne(() => PatientProfile, (patient) => patient.aiRecommendationLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: PatientProfile;

  @CreateDateColumn()
  createdAt: Date;
}
