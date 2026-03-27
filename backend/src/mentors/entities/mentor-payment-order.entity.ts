import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('mentor_payment_orders')
export class MentorPaymentOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  studentId: string;

  @Column({ type: 'uuid' })
  @Index()
  mentorId: string;

  @Column({ type: 'int' })
  durationMinutes: number;

  @Column({ type: 'int' })
  amountInPaise: number;

  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  @Index({ unique: true })
  providerOrderId: string;

  @Column({ type: 'varchar', length: 120, nullable: true, unique: true })
  paymentId: string | null;

  @Column({ type: 'varchar', length: 20, default: 'created' })
  status: 'created' | 'paid' | 'expired';

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
