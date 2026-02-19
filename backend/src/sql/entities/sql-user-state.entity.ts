import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('sql_user_states')
@Index(['userId', 'problemId'], { unique: true })
export class SqlUserState {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'uuid' })
    problemId: string;

    @Column({ type: 'int', default: 0 })
    mastery: number;

    @Column({ type: 'timestamp', nullable: true })
    nextReviewAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    lastReviewedAt: Date | null;

    @Column({ type: 'int', nullable: true })
    lastScore: number | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
