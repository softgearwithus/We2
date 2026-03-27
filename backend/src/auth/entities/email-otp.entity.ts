import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum EmailOtpPurpose {
  REGISTER = 'register',
  PASSWORD_RESET = 'password_reset',
}

@Entity('email_otp')
@Index('IDX_email_otp_email_purpose_unique', ['email', 'purpose'], {
  unique: true,
})
export class EmailOtp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 32, default: EmailOtpPurpose.REGISTER })
  purpose: EmailOtpPurpose;

  @Column({ type: 'varchar', length: 255 })
  otpHash: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSentAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  consumedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
