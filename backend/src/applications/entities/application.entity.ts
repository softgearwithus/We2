import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Placement } from '../../placements/entities/placement.entity';
import { HiringAssessment } from '../../placements/entities/hiring-assessment.entity';

export enum ApplicationStatus {
  APPLIED = 'Applied',
  REVIEWING = 'Reviewing',
  INTERVIEWING = 'Interviewing',
  OFFERED = 'Offered',
  REJECTED = 'Rejected',
}

export enum CandidatePipelineStage {
  INVITED = 'invited',
  IN_PROGRESS = 'in_progress',
  PENDING_REVIEW = 'pending_review',
  ADVANCED = 'advanced',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum CandidateReviewDecision {
  PENDING = 'pending',
  ADVANCE = 'advance',
  REJECT = 'reject',
}

export enum CandidateSource {
  APPLIED = 'applied',
  INVITED = 'invited',
}

export enum ApplicationScreeningStatus {
  NOT_SCREENED = 'not_screened',
  SCREENED = 'screened',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  RETRY_PENDING = 'retry_pending',
}

export enum StudentApplicationStatus {
  APPLIED = 'applied',
  REJECTED = 'rejected',
  SHORTLISTED = 'shortlisted',
  INTERVIEW_INVITED = 'interview_invited',
  INTERVIEW_COMPLETED = 'interview_completed',
}

@Entity()
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: User | null;

  @Column({ type: 'uuid', nullable: true })
  studentId: string | null;

  @ManyToOne(() => Placement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'placementId' })
  placement: Placement;

  @Column()
  @Index()
  placementId: string;

  @ManyToOne(() => HiringAssessment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assessmentId' })
  assessment: HiringAssessment | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  assessmentId: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  candidateName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  candidateEmail: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  candidatePhone: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  candidateDepartment: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  candidateYear: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  candidateLocation: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  candidateLinkedinUrl: string | null;

  @Column({ type: 'text', nullable: true })
  resumeDriveUrl: string | null;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.APPLIED,
  })
  status: ApplicationStatus;

  @Column({
    type: 'enum',
    enum: CandidatePipelineStage,
    default: CandidatePipelineStage.PENDING_REVIEW,
  })
  pipelineStage: CandidatePipelineStage;

  @Column({
    type: 'enum',
    enum: CandidateReviewDecision,
    default: CandidateReviewDecision.PENDING,
  })
  reviewDecision: CandidateReviewDecision;

  @Column({
    type: 'enum',
    enum: CandidateSource,
    default: CandidateSource.APPLIED,
  })
  source: CandidateSource;

  @Column({ type: 'float', nullable: true })
  score: number | null;

  @Column({
    type: 'varchar',
    length: 40,
    default: ApplicationScreeningStatus.NOT_SCREENED,
  })
  screeningStatus: ApplicationScreeningStatus;

  @Column({ type: 'text', nullable: true })
  screeningSummary: string | null;

  @Column('text', { array: true, default: '{}' })
  screeningMatchedSkills: string[];

  @Column('text', { array: true, default: '{}' })
  screeningMissingSkills: string[];

  @Column({ type: 'jsonb', nullable: true })
  screeningDetails: Record<string, any> | null;

  @Column({ type: 'timestamp', nullable: true })
  screenedAt: Date | null;

  @Column({
    type: 'varchar',
    length: 40,
    default: StudentApplicationStatus.APPLIED,
  })
  studentFacingStatus: StudentApplicationStatus;

  @Column({ type: 'timestamp', nullable: true })
  interviewRetriedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  interviewRetryCount: number;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string | null;

  @Column({ type: 'text', nullable: true })
  submissionSummary: string | null;

  @Column({ type: 'jsonb', nullable: true })
  submissionArtifacts: Record<string, any> | null;

  @Column({ type: 'varchar', length: 120, unique: true, nullable: true })
  inviteToken: string | null;

  @Column({ type: 'text', nullable: true })
  inviteUrl: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  aiInterviewSessionId: string | null;

  @Column({ type: 'text', nullable: true })
  candidateJoinUrl: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  interviewLaunchStatus: string | null;

  @Column({ type: 'text', nullable: true })
  interviewLaunchError: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  interviewEmailStatus: string | null;

  @Column({ type: 'text', nullable: true })
  interviewEmailError: string | null;

  @Column({ type: 'timestamp', nullable: true })
  interviewEmailSentAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  invitedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn()
  appliedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
