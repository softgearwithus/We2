import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('mentor_sessions')
export class MentorSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    studentId: string;

    @Column({ type: 'uuid' })
    mentorId: string;

    @Column({ type: 'varchar', length: 180 })
    topic: string;

    @Column({ type: 'int' })
    durationMinutes: number;

    @Column({ type: 'int' })
    priceInr: number;

    @Column({ type: 'varchar', length: 30, default: 'requested' })
    status: 'requested' | 'accepted' | 'declined' | 'completed';

    @Column({ type: 'varchar', length: 255, nullable: true })
    meetingLink: string | null;

    @Column({ type: 'timestamp', nullable: true })
    scheduledAt: Date | null;

    @Column({ type: 'varchar', length: 60, nullable: true })
    paymentId: string | null;

    @Column({ type: 'varchar', length: 80, nullable: true })
    paymentOrderId: string | null;

    @Column({ type: 'varchar', length: 30, default: 'pending' })
    paymentStatus: 'pending' | 'paid' | 'refunded';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
