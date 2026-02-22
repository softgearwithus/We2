import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { DsaProblem, Difficulty } from './dsa/entities/dsa-problem.entity';
import { Submission } from './dsa/entities/submission.entity';
import { User } from './users/user.entity';
import { resolveDbConfig } from './common/db-config';

dotenv.config();

const dbType = process.env.DB_TYPE || 'postgres';
if (dbType !== 'postgres') {
    throw new Error('SQLite is not supported. Set DB_TYPE=postgres.');
}

const AppDataSource = new DataSource({
    type: 'postgres',
    ...resolveDbConfig(),
    entities: [DsaProblem, Submission, User],
    synchronize: true,
});

const resolveDatasetPath = () => {
    const candidates = [
        path.resolve(process.cwd(), 'dataset.json'),
        path.resolve(process.cwd(), '..', 'dataset.json'),
    ];
    return candidates.find((candidate) => fs.existsSync(candidate)) || null;
};

const normalizeSlug = (value?: string) => {
    if (!value) return '';
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-+|-+$)/g, '');
};

async function seed() {
    const datasetPath = resolveDatasetPath();
    if (!datasetPath) {
        throw new Error('dataset.json not found');
    }

    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(DsaProblem);

    const raw = fs.readFileSync(datasetPath, 'utf-8');
    const dataset = JSON.parse(raw) as Array<any>;

    const created: string[] = [];
    const updated: string[] = [];

    for (const entry of dataset) {
        const slug = normalizeSlug(entry.leetcode_slug || entry.title);
        if (!slug) {
            continue;
        }

        const rawDifficulty = String(entry.difficulty || 'easy').toLowerCase();
        const difficulty =
            rawDifficulty === 'hard'
                ? Difficulty.HARD
                : rawDifficulty === 'medium'
                    ? Difficulty.MEDIUM
                    : Difficulty.EASY;

        const baseProblem: Partial<DsaProblem> = {
            title: entry.title,
            slug,
            leetcodeSlug: entry.leetcode_slug || slug,
            leetcodeUrl: entry.leetcode_slug ? `https://leetcode.com/problems/${entry.leetcode_slug}/` : null,
            difficulty,
            description: entry.description || '<p>Description not available yet.</p>',
            examples: [],
            constraints: [],
            starterCode: {},
            codeTemplates: null,
            languageMeta: null,
            testCases: [],
            categories: entry.patterns || [],
            hints: [],
            solution: null,
            isActive: true,
        };

        const existing = await repo.findOne({ where: { slug } });
        if (existing) {
            Object.assign(existing, baseProblem);
            await repo.save(existing);
            updated.push(slug);
        } else {
            const createdProblem = repo.create(baseProblem);
            await repo.save(createdProblem);
            created.push(slug);
        }
    }

    console.log(`Seeded dataset.json problems. Created: ${created.length}, Updated: ${updated.length}`);
}

seed()
    .catch((error) => {
        console.error('Failed to seed dataset.json:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });
