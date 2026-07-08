import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Placement } from './placement.entity';
import { HiringAssessmentPlacementLink } from './hiring-assessment-placement-link.entity';

export enum HiringAssessmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export type HiringAssessmentFile = {
  path: string;
  content: string;
};

export type HiringAssessmentContextSource = {
  type: 'job_description' | 'repo' | 'ats' | 'role' | 'company_profile' | 'notes';
  label?: string;
  url?: string;
  content?: string;
  metadata?: Record<string, any>;
};

@Entity('hiring_assessments')
export class HiringAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  placementId: string | null;

  @ManyToOne(() => Placement, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'placementId' })
  placement: Placement | null;

  @Column({ type: 'uuid' })
  @Index()
  companyId: string;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  language: string | null;

  @Column({ type: 'int', nullable: true })
  timeLimitMinutes: number | null;

  @Column({ type: 'text', nullable: true })
  instructions: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  stageName: string | null;

  @Column({ type: 'text', nullable: true })
  prompt: string | null;

  @Column({ type: 'jsonb', nullable: true })
  contextSnapshot: Record<string, any> | null;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  contextSources: HiringAssessmentContextSource[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  files: HiringAssessmentFile[];

  @OneToMany(() => HiringAssessmentPlacementLink, (link) => link.assessment)
  placementLinks: HiringAssessmentPlacementLink[];

  @Column({
    type: 'enum',
    enum: HiringAssessmentStatus,
    default: HiringAssessmentStatus.DRAFT,
  })
  status: HiringAssessmentStatus;

  @Column({ type: 'int', default: 1 })
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
