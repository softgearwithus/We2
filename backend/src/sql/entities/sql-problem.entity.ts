import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { SqlSubmission } from './sql-submission.entity';

export enum SqlDifficulty {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
}

export enum SqlPlatform {
    LEETCODE = 'leetcode',
    HACKERRANK = 'hackerrank',
}

@Entity('sql_problems')
export class SqlProblem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'varchar', unique: true })
    slug: string;

    @Column({ type: 'varchar', length: 20, default: SqlPlatform.LEETCODE })
    platform: SqlPlatform;

    @Column({ type: 'varchar', length: 255, nullable: true })
    externalId?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    leetcodeSlug?: string | null;

    @Column({ type: 'varchar', length: 512, nullable: true })
    leetcodeUrl?: string | null;

    @Column({ type: 'varchar', length: 512, nullable: true })
    externalUrl?: string | null;

    @Column({ type: 'varchar' })
    difficulty: SqlDifficulty;

    @Column({ type: 'simple-json', nullable: true })
    companyTags?: string[] | null;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'simple-json' })
    examples: Array<{ input: string; output: string; explanation?: string }>;

    @Column({ type: 'simple-json' })
    constraints: string[];

    @Column({ type: 'simple-json' })
    starterCode: Record<string, string>;

    @Column({ type: 'simple-json', nullable: true })
    codeTemplates?: Record<string, string> | null;

    @Column({ type: 'simple-json', nullable: true })
    languageMeta?: Array<{ lang: string; langSlug: string }> | null;

    @Column({ type: 'simple-json' })
    testCases: Array<{
        input: string;
        expected: string;
        isHidden?: boolean;
    }>;

    @Column({ type: 'simple-json', nullable: true })
    categories: string[] | null;

    @Column({ type: 'simple-json', nullable: true })
    hints: string[] | null;

    @Column({ type: 'simple-json', nullable: true })
    solution: {
        approach?: string;
        code?: Record<string, string>;
        complexity?: {
            time?: string;
            space?: string;
        };
    } | null;

    @Column({ type: 'int', default: 0 })
    likes: number;

    @Column({ type: 'int', default: 0 })
    dislikes: number;

    @Column({ type: 'int', default: 0 })
    submissions: number;

    @Column({ type: 'int', default: 0 })
    accepted: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => SqlSubmission, (submission) => submission.problem)
    userSubmissions: SqlSubmission[];
}
