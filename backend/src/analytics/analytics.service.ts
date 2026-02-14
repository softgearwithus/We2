import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission, SubmissionStatus } from '../dsa/entities/submission.entity';
import { DsaProblem } from '../dsa/entities/dsa-problem.entity';
import { UserGamification } from '../gamification/entities/user-gamification.entity';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(Submission)
        private submissionRepo: Repository<Submission>,
        @InjectRepository(UserGamification)
        private gamificationRepo: Repository<UserGamification>,
    ) { }

    async getUserDashboardStats(userId: string) {
        // 1. Get Gamification Stats
        const gamification = await this.gamificationRepo.findOne({ where: { userId } });

        // 2. Get Submission Stats
        const submissions = await this.submissionRepo.find({
            where: { userId },
            relations: ['problem'],
            order: { submittedAt: 'DESC' },
        });

        const totalSubmissions = submissions.length;
        const acceptedSubmissions = submissions.filter(s => s.status === SubmissionStatus.ACCEPTED);
        const uniqueSolved = new Set(acceptedSubmissions.map(s => s.problemId)).size;

        // Calculate Acceptance Rate
        const acceptanceRate = totalSubmissions > 0
            ? Math.round((acceptedSubmissions.length / totalSubmissions) * 100)
            : 0;

        // 3. Difficulty Breakdown
        const difficultyStats: Record<string, number> = {
            Easy: 0,
            Medium: 0,
            Hard: 0,
        };
        const solvedProblemIds = new Set<string>();

        acceptedSubmissions.forEach(s => {
            if (s.problem && !solvedProblemIds.has(s.problemId)) {
                solvedProblemIds.add(s.problemId);
                const diff = s.problem.difficulty;
                if (difficultyStats[diff]) { // e.g. 'Easy', 'Medium', 'Hard'
                    difficultyStats[diff]++;
                }
            }
        });

        return {
            totalXp: gamification?.totalXp || 0,
            currentLevel: gamification?.currentLevel || 1,
            currentStreak: gamification?.currentStreak || 0,
            problemsSolved: uniqueSolved,
            totalSubmissions,
            acceptanceRate,
            difficultyStats,
            recentActivity: submissions.slice(0, 5).map(s => ({
                id: s.id,
                problemTitle: s.problem?.title,
                status: s.status,
                submittedAt: s.submittedAt,
            }))
        };
    }

    async getHeatmapData(userId: string) {
        // Get all submissions for the last year
        // For simplicity, fetch all and aggregate in memory (optimize later with SQL GROUP BY)
        const submissions = await this.submissionRepo.find({
            where: { userId },
            select: ['submittedAt', 'status']
        });

        const heatmap: Record<string, number> = {};

        submissions.forEach(s => {
            const date = s.submittedAt.toISOString().split('T')[0]; // YYYY-MM-DD
            heatmap[date] = (heatmap[date] || 0) + 1;
        });

        // Format for frontend (e.g., array of { date, count })
        return Object.entries(heatmap).map(([date, count]) => ({ date, count }));
    }

    async getSkillRadar(userId: string) {
        // Fetch passed submissions with problem tags
        // This requires 'categories' or 'tags' on DsaProblem. 
        // Assuming 'categories' is a string[] or json column.

        const submissions = await this.submissionRepo.find({
            where: { userId, status: SubmissionStatus.ACCEPTED },
            relations: ['problem'],
        });

        const skillMap: Record<string, number> = {};

        submissions.forEach(s => {
            if (s.problem && s.problem.categories) {
                s.problem.categories.forEach(tag => {
                    skillMap[tag] = (skillMap[tag] || 0) + 1;
                });
            }
        });

        // Return top 6 categories
        return Object.entries(skillMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([subject, A]) => ({ subject, A, fullMark: 20 })); // Normalized or raw
    }
}
