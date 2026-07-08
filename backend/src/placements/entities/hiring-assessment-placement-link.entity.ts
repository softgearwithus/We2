import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HiringAssessment } from './hiring-assessment.entity';
import { Placement } from './placement.entity';

@Entity('hiring_assessment_placements')
@Index(['assessmentId', 'placementId'], { unique: true })
export class HiringAssessmentPlacementLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  companyId: string;

  @Column({ type: 'uuid' })
  @Index()
  assessmentId: string;

  @ManyToOne(() => HiringAssessment, (assessment) => assessment.placementLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assessmentId' })
  assessment: HiringAssessment;

  @Column({ type: 'uuid' })
  @Index()
  placementId: string;

  @ManyToOne(() => Placement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'placementId' })
  placement: Placement;

  @Column({ type: 'varchar', length: 120, nullable: true })
  stageName: string | null;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ type: 'jsonb', nullable: true })
  contextSnapshot: Record<string, any> | null;

  @CreateDateColumn()
  attachedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
