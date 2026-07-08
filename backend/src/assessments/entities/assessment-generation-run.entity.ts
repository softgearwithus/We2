import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type AssessmentGenerationRunStatus =
  | 'generating'
  | 'succeeded'
  | 'failed';

@Entity('assessment_generation_runs')
export class AssessmentGenerationRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  companyId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  roleId: string | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  assessmentId: string | null;

  @Column({ type: 'varchar', length: 32, default: 'generating' })
  status: AssessmentGenerationRunStatus;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  mode: string | null;

  @Column({ type: 'varchar', length: 24, nullable: true })
  generationMode: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  repositoryIds: string[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  contextSources: Record<string, any>[];

  @Column({ type: 'varchar', length: 60, nullable: true })
  provider: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  model: string | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'jsonb', nullable: true })
  inputSnapshot: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  outputSnapshot: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  validationResult: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
