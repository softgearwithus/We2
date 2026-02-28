import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('email_otp')
export class EmailOtp {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ type: 'varchar', length: 255 })
    email: string;

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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
