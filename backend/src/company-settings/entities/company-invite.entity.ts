import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CompanyMemberRole } from './company-member.entity';

export enum CompanyInviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

export enum CompanyInviteEmailDeliveryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity('company_invites')
export class CompanyInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 30, default: CompanyMemberRole.MEMBER })
  role: CompanyMemberRole;

  @Column({ type: 'varchar', length: 128 })
  @Index({ unique: true })
  tokenHash: string;

  @Column({ type: 'varchar', length: 30, default: CompanyInviteStatus.PENDING })
  status: CompanyInviteStatus;

  @Column({ type: 'uuid', nullable: true })
  invitedByUserId: string | null;

  @Column({ type: 'uuid', nullable: true })
  acceptedByUserId: string | null;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date | null;

  @Column({
    type: 'varchar',
    length: 30,
    default: CompanyInviteEmailDeliveryStatus.PENDING,
  })
  emailDeliveryStatus: CompanyInviteEmailDeliveryStatus;

  @Column({ type: 'text', nullable: true })
  emailDeliveryError: string | null;

  @Column({ type: 'timestamp', nullable: true })
  emailSentAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  emailLastAttemptAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
