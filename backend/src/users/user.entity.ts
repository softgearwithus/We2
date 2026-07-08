import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { randomUUID } from 'crypto';

export enum UserRole {
  STUDENT = 'student',
  MENTOR = 'mentor',
  COMPANY_ADMIN = 'company_admin',
  COLLEGE_ADMIN = 'college_admin',
  SUPER_ADMIN = 'super_admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string | null;

  @Column({ select: false }) // Don't return password by default
  password: string;

  @Column({
    type: 'varchar',
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ type: 'uuid', nullable: true })
  collegeId: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  department: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  year: string | null;

  @Column({ type: 'varchar', length: 120, unique: true, nullable: true })
  credentialId?: string | null;

  @Column({
    type: 'varchar',
    default: 'free', // free, standard, pro
  })
  subscriptionPlan: string;

  @Column({
    type: 'varchar',
    default: 'inactive', // active, inactive, expired
  })
  subscriptionStatus: string;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionEndDate: Date | null;

  @Column({ type: 'varchar', nullable: true })
  pausedSubscriptionPlan?: string | null;

  @Column({ type: 'int', default: 0 })
  pausedSubscriptionRemainingDays: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  @Column({ type: 'varchar', length: 128, nullable: true })
  twoFactorSecret?: string | null;

  @Column({ type: 'int', default: 0 })
  sessionVersion: number;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  lastLoginIp?: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  lastLoginUserAgent?: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  timezone?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarUrl?: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  username?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  roleTitle?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  location?: string | null;

  @Column({ type: 'text', nullable: true })
  bio?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  websiteUrl?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  githubUrl?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  linkedinUrl?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  lastActiveAt?: Date | null;

  // --- Usage Limits ---
  @Column({ type: 'timestamp', nullable: true })
  usageLastReset: Date | null;

  @Column({ default: 0 })
  audioDrillUsage: number;

  @Column({ default: 0 })
  videoInterviewUsage: number;

  @Column({ default: 0 })
  drillTopicsRefreshCount: number;

  @Column({ default: 0 })
  resumeScanUsage: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  ensureId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
