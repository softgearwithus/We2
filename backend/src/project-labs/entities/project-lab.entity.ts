import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { ProjectLabSubmission } from './project-lab-submission.entity';

export enum ProjectComplexity {
    BEGINNER = 'Beginner',
    INTERMEDIATE = 'Intermediate',
    ADVANCED = 'Advanced',
}

export type ProjectLabTask = {
    id: string;
    title: string;
    status: string;
};

export type ProjectLabReadme = {
    problem: string;
    solution: string;
    features: string[];
    outcomes: string[];
};

export type ProjectLabResource = {
    title: string;
    url: string;
    type: 'docs' | 'design' | 'guide' | 'video';
};

export type ProjectLabDetails = {
    frontend?: string;
    backend?: string;
    database?: string;
    architecture?: string;
    prerequisites: string[];
    tools: string[];
    resources: ProjectLabResource[];
};

@Entity('project_labs')
export class ProjectLab {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 80 })
    domainId: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'varchar' })
    complexity: ProjectComplexity;

    @Column({ type: 'varchar', length: 40 })
    estimatedTime: string;

    @Column({ type: 'simple-json', nullable: true })
    skills: string[] | null;

    @Column({ type: 'simple-json', nullable: true })
    tags: string[] | null;

    @Column({ type: 'simple-json', nullable: true })
    tasks: ProjectLabTask[] | null;

    @Column({ type: 'simple-json', nullable: true })
    readme: ProjectLabReadme | null;

    @Column({ type: 'simple-json', nullable: true })
    details: ProjectLabDetails | null;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => ProjectLabSubmission, (submission) => submission.project)
    submissions: ProjectLabSubmission[];
}
