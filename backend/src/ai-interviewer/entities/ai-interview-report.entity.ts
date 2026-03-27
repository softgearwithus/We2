import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('ai_interview_reports')
export class AiInterviewReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  sessionId: string;

  @Column({ type: 'int', nullable: true })
  overallScore: number | null;

  @Column({ type: 'json', nullable: true })
  dimensionScores: Record<string, any> | null;

  @Column({ type: 'json', nullable: true })
  strengths: string[] | null;

  @Column({ type: 'json', nullable: true })
  weaknesses: string[] | null;

  @Column({ type: 'json', nullable: true })
  recommendations: string[] | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
