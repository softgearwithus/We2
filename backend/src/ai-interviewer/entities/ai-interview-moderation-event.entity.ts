import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('ai_interview_moderation_events')
export class AiInterviewModerationEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  sessionId: string;

  @Column({ type: 'int', default: 1 })
  warningLevel: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'json', nullable: true })
  evidenceRefs: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;
}
