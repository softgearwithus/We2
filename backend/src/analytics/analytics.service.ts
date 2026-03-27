import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewSession } from '../interviews/entities/interview-session.entity';
import { UserGamification } from '../gamification/entities/user-gamification.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(InterviewSession)
    private interviewRepo: Repository<InterviewSession>,
    @InjectRepository(UserGamification)
    private gamificationRepo: Repository<UserGamification>,
  ) {}

  async getUserDashboardStats(userId: string) {
    // 1. Get Gamification Stats
    const gamification = await this.gamificationRepo.findOne({
      where: { userId },
    });

    // 2. Get Interview Stats
    const interviews = await this.interviewRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const totalSubmissions = interviews.length;
    const acceptedSubmissions = interviews.filter(
      (s) => s.status === 'completed',
    );
    const uniqueSolved = 0;

    // Calculate Acceptance Rate
    const acceptanceRate =
      totalSubmissions > 0
        ? Math.round((acceptedSubmissions.length / totalSubmissions) * 100)
        : 0;

    // 3. Difficulty Breakdown (DSA/SQL removed)
    const difficultyStats: Record<string, number> = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };

    return {
      totalXp: gamification?.totalXp || 0,
      currentLevel: gamification?.currentLevel || 1,
      currentStreak: gamification?.currentStreak || 0,
      problemsSolved: uniqueSolved,
      totalSubmissions,
      acceptanceRate,
      difficultyStats,
      recentActivity: interviews.slice(0, 5).map((s) => ({
        id: s.id,
        problemTitle: s.type,
        status: s.status,
        submittedAt: s.createdAt,
      })),
    };
  }

  async getHeatmapData(userId: string) {
    const submissions = await this.interviewRepo.find({
      where: { userId },
      select: ['createdAt'],
    });

    const heatmap: Record<string, number> = {};

    submissions.forEach((s) => {
      const date = s.createdAt.toISOString().split('T')[0];
      heatmap[date] = (heatmap[date] || 0) + 1;
    });

    return Object.entries(heatmap).map(([date, count]) => ({ date, count }));
  }

  async getSkillRadar(userId: string) {
    const sessions = await this.interviewRepo.find({ where: { userId } });
    const completed = sessions.filter(
      (session) => session.status === 'completed',
    ).length;

    return [
      {
        subject: 'Communication',
        A: Math.min(20, completed * 2),
        fullMark: 20,
      },
      { subject: 'Interview', A: Math.min(20, completed * 2), fullMark: 20 },
      {
        subject: 'Projects',
        A: Math.min(20, Math.floor(completed * 1.5)),
        fullMark: 20,
      },
    ];
  }
}
