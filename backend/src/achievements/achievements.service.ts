import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Achievement,
  AchievementCategory,
} from './entities/achievement.entity';
import { CreateAchievementDto } from './dto/create-achievement.dto';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private achievementsRepo: Repository<Achievement>,
  ) {}

  /**
   * Award an achievement to a user
   */
  async create(dto: CreateAchievementDto): Promise<Achievement> {
    const achievement = this.achievementsRepo.create({
      ...dto,
      earnedAt: new Date(),
    });
    return this.achievementsRepo.save(achievement);
  }

  /**
   * Get all achievements earned by the current user
   */
  async findByUser(userId: string): Promise<Achievement[]> {
    return this.achievementsRepo.find({
      where: { userId },
      order: { earnedAt: 'DESC' },
    });
  }

  /**
   * Get a single achievement
   */
  async findOne(id: string): Promise<Achievement> {
    const achievement = await this.achievementsRepo.findOne({ where: { id } });
    if (!achievement) {
      throw new NotFoundException(`Achievement ${id} not found`);
    }
    return achievement;
  }

  /**
   * Get user XP summary
   */
  async getXpSummary(userId: string) {
    const achievements = await this.findByUser(userId);

    const byCategory: Record<string, { totalXp: number; count: number }> = {};
    for (const cat of Object.values(AchievementCategory)) {
      const catAchievements = achievements.filter((a) => a.category === cat);
      if (catAchievements.length > 0) {
        byCategory[cat] = {
          totalXp: catAchievements.reduce((sum, a) => sum + a.xp, 0),
          count: catAchievements.length,
        };
      }
    }

    return {
      totalXp: achievements.reduce((sum, a) => sum + a.xp, 0),
      totalAchievements: achievements.length,
      byCategory,
      recent: achievements.slice(0, 5).map((a) => ({
        title: a.title,
        xp: a.xp,
        category: a.category,
        earnedAt: a.earnedAt,
      })),
    };
  }
}
