import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

export enum InterviewType {
  TECHNICAL = 'technical',
  HR = 'hr',
  GROUP_DISCUSSION = 'group_discussion',
  BEHAVIORAL = 'behavioral',
}

export enum InterviewDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('interview_sessions')
export class InterviewSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'varchar',
  })
  type: InterviewType;

  @Column({
    type: 'varchar',
    default: InterviewDifficulty.BEGINNER,
  })
  difficulty: InterviewDifficulty;

  @Column({
    type: 'varchar',
    default: InterviewStatus.SCHEDULED,
  })
  status: InterviewStatus;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  duration: number; // in seconds

  @Column({ type: 'simple-json', nullable: true })
  questions: any[]; // AI-generated questions

  @Column({ type: 'simple-json', nullable: true })
  analysis: any; // Detailed metrics (fluency, grammar, etc.)

  @Column({ type: 'simple-json', nullable: true })
  responses: any[]; // User responses

  @Column({ type: 'varchar', length: 255, nullable: true })
  aiInterviewerId: string | null; // AI persona identifier

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalCallId: string | null; // External provider call ID (e.g., Vapi)

  @Column({ type: 'varchar', length: 50, nullable: true })
  analysisProvider: string | null; // e.g., gemini, vapi

  @Column({ type: 'int', nullable: true })
  overallScore: number | null; // 0-100

  @Column({ type: 'simple-json', nullable: true })
  strengths: string[] | null;

  @Column({ type: 'simple-json', nullable: true })
  improvements: string[] | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
