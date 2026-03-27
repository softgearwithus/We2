import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('ai_interview_sessions')
export class AiInterviewSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  interviewSessionId: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  resumeId: string | null;

  @Column({ type: 'varchar', length: 30, default: 'scheduled' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date | null;

  @Column({ type: 'int', default: 900 })
  timerSeconds: number;

  @Column({ type: 'int', default: 0 })
  warningsCount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  terminationReason: string | null;

  @Column({ type: 'json', nullable: true })
  coverageMap: Record<string, any> | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  providerVersion: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  externalSessionId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
