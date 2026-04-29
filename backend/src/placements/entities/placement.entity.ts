import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

export enum PlacementType {
  INTERNSHIP = 'Internship',
  FULL_TIME = 'Full-Time',
  PART_TIME = 'Part-Time',
  CONTRACT = 'Contract',
  REMOTE = 'Remote',
}

export enum WorkMode {
  OFFLINE = 'Offline',
  HYBRID = 'Hybrid',
  REMOTE = 'Remote',
}

export enum PlacementStatus {
  ACTIVE = 'Active Hiring',
  UPCOMING = 'Upcoming',
  CLOSED = 'Closed',
}

export enum DriveVerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class Placement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  companyName: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'companyId' })
  company: User;

  @Column({ nullable: true })
  companyId: string;

  @Column({ nullable: true })
  companyLogo: string;

  @Column({
    type: 'enum',
    enum: PlacementType,
    default: PlacementType.FULL_TIME,
  })
  type: PlacementType;

  @Column({
    type: 'enum',
    enum: WorkMode,
    default: WorkMode.OFFLINE,
  })
  workMode: WorkMode;

  @Column({
    type: 'enum',
    enum: PlacementStatus,
    default: PlacementStatus.ACTIVE,
  })
  status: PlacementStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  applyLink: string;

  @Column({ nullable: true })
  jobProfile: string;

  @Column({ nullable: true })
  packageOffered: string;

  @Column('text', { array: true, default: '{}' })
  roles: string[];

  @Column('text', { array: true, default: '{}' })
  skillsRequired: string[];

  @Column({ nullable: true })
  experienceRequired: string;

  @Column({ type: 'int', nullable: true })
  openings: number;

  @Column({ type: 'timestamp', nullable: true })
  applicationDeadline: Date;

  @Column({ nullable: true })
  batchEligible: string;

  @Column({ nullable: true })
  salaryRange: string;

  @Column({ nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: DriveVerificationStatus,
    default: DriveVerificationStatus.PENDING,
  })
  verificationStatus: DriveVerificationStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
