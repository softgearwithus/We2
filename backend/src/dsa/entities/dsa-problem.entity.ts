import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Submission } from './submission.entity';

export enum Difficulty {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
}

export enum ProblemCategory {
    ARRAY = 'array',
    STRING = 'string',
    LINKED_LIST = 'linked_list',
    TREE = 'tree',
    GRAPH = 'graph',
    DP = 'dp',
    GREEDY = 'greedy',
    BACKTRACKING = 'backtracking',
    SORTING = 'sorting',
    SEARCHING = 'searching',
}

export enum DsaPlatform {
    LEETCODE = 'leetcode',
    HACKERRANK = 'hackerrank',
    CODEFORCES = 'codeforces',
}

@Entity('dsa_problems')
export class DsaProblem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'varchar', unique: true })
    slug: string;

    @Column({ type: 'varchar', length: 20, default: DsaPlatform.LEETCODE })
    platform: DsaPlatform;

    @Column({ type: 'varchar', length: 255, nullable: true })
    externalId?: string | null; // LeetCode slug, HackerRank slug, or Codeforces problem id

    @Column({ type: 'varchar', length: 255, nullable: true })
    leetcodeSlug?: string | null;

    @Column({ type: 'varchar', length: 512, nullable: true })
    leetcodeUrl?: string | null;

    @Column({ type: 'varchar', length: 512, nullable: true })
    externalUrl?: string | null; // canonical URL for any platform

    @Column({ type: 'varchar' })
    difficulty: Difficulty;

    @Column({ type: 'simple-json', nullable: true })
    companyTags?: string[] | null;

    @Column({ type: 'text' })
    description: string; // HTML/Markdown

    @Column({ type: 'simple-json' })
    examples: Array<{ input: string; output: string; explanation?: string }>;

    @Column({ type: 'simple-json' })
    constraints: string[];

    @Column({ type: 'simple-json' })
    starterCode: Record<string, string>; // { javascript: '...', python: '...', java: '...' }

    @Column({ type: 'simple-json', nullable: true })
    codeTemplates?: Record<string, string> | null; // { cpp: '...', python: '...' }

    @Column({ type: 'simple-json', nullable: true })
    languageMeta?: Array<{ lang: string; langSlug: string }> | null;

    @Column({ type: 'simple-json' })
    testCases: Array<{
        input: string;
        expected: string;
        isHidden?: boolean;
    }>;

    @Column({ type: 'simple-json', nullable: true })
    categories: ProblemCategory[];

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

    // Relationships
    @OneToMany(() => Submission, (submission) => submission.problem)
    userSubmissions: Submission[];
}
