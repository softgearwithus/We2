import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('mentor_payouts')
export class MentorPayout {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    mentorId: string;

    @Column({ type: 'int' })
    amountInr: number;

    @Column({ type: 'varchar', length: 60, nullable: true })
    referenceId: string | null;

    @Column({ type: 'varchar', length: 40, default: 'Paid' })
    status: 'Paid' | 'Pending';

    @Column({ type: 'timestamp', nullable: true })
    paidAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
