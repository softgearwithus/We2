import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { ProjectLab } from './project-lab.entity';

export enum ProjectLabSubmissionStatus {
    SUBMITTED = 'submitted',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    COMPLETED = 'completed',
}

@Entity('project_lab_submissions')
export class ProjectLabSubmission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    projectId: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'varchar', length: 500 })
    repositoryUrl: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    liveDemoUrl: string | null;

    @Column({ type: 'varchar' })
    status: ProjectLabSubmissionStatus;

    @Column({ type: 'text', nullable: true })
    reviewNotes: string | null;

    @Column({ type: 'timestamp' })
    submittedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    reviewedAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => ProjectLab, (project) => project.submissions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'projectId' })
    project: ProjectLab;
}
