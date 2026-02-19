import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('sql_problem_insights')
@Index(['problemId'], { unique: true })
export class SqlProblemInsight {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    problemId: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'varchar', length: 120, nullable: true })
    model: string | null;

    @Column({ type: 'timestamp', nullable: true })
    generatedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
