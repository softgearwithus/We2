import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { DsaProblem } from './dsa-problem.entity';

export enum SubmissionStatus {
    ACCEPTED = 'accepted',
    WRONG_ANSWER = 'wrong_answer',
    RUNTIME_ERROR = 'runtime_error',
    TIME_LIMIT_EXCEEDED = 'time_limit_exceeded',
    COMPILE_ERROR = 'compile_error',
    PENDING = 'pending',
    QUEUED = 'queued',
    RUNNING = 'running',
}

@Entity('dsa_submissions')
export class Submission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'uuid' })
    problemId: string;

    @Column({ type: 'varchar', length: 50 })
    language: string; // javascript, python, java

    @Column({ type: 'text' })
    code: string;

    @Column({ type: 'varchar' })
    status: SubmissionStatus;

    @Column({ type: 'int', default: 0 })
    passedTests: number;

    @Column({ type: 'int', default: 0 })
    totalTests: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    runtimeMs: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    memoryKb: string | null;

    @Column({ type: 'int', default: 0, nullable: true })
    score: number;

    @Column({ type: 'text', nullable: true })
    error: string | null;

    @Column({ type: 'text', nullable: true })
    failedTestInput: string | null;

    @Column({ type: 'text', nullable: true })
    failedTestExpected: string | null;

    @Column({ type: 'text', nullable: true })
    failedTestActual: string | null;

    @CreateDateColumn()
    submittedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date | null;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relationships
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => DsaProblem, (problem) => problem.userSubmissions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'problemId' })
    problem: DsaProblem;
}
