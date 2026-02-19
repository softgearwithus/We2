import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('sql_training_sessions')
@Index(['userId'], { unique: true })
export class SqlTrainingSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'uuid' })
    problemId: string;

    @Column({ type: 'varchar', length: 20, default: 'srs' })
    mode: 'srs' | 'manual';

    @Column({ type: 'timestamp' })
    assignedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    expiresAt: Date | null;

    @Column({ type: 'boolean', default: false })
    submitted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
