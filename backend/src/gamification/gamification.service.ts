import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGamification } from './entities/user-gamification.entity';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';

@Injectable()
export class GamificationService {
    constructor(
        @InjectRepository(UserGamification)
        private gamificationRepo: Repository<UserGamification>,
        @InjectRepository(Badge)
        private badgeRepo: Repository<Badge>,
        @InjectRepository(UserBadge)
        private userBadgeRepo: Repository<UserBadge>,
    ) { }

    async getProfile(userId: string) {
        let profile = await this.gamificationRepo.findOne({ where: { userId } });
        if (!profile) {
            profile = this.gamificationRepo.create({ userId });
            await this.gamificationRepo.save(profile);
        }
        return profile;
    }

    async addXp(userId: string, amount: number) {
        const profile = await this.getProfile(userId);
        profile.totalXp += amount;

        // Simple leveling logic: Level = 1 + sqrt(XP / 100)
        profile.currentLevel = Math.floor(1 + Math.sqrt(profile.totalXp / 100));
        profile.lastActivityDate = new Date();

        await this.gamificationRepo.save(profile);
        return profile;
    }

    async updateStreak(userId: string) {
        const profile = await this.getProfile(userId);
        const now = new Date();
        const last = profile.lastActivityDate ? new Date(profile.lastActivityDate) : null;

        if (!last) {
            profile.currentStreak = 1;
        } else {
            const diffInHours = (now.getTime() - last.getTime()) / (1000 * 3600);
            if (diffInHours < 24 && now.getDate() !== last.getDate()) {
                // Continued streak (same day logic check needed, simple 24h window for now)
                // Actually, strict day check:
                // If last activity was yesterday, increment.
                // If today, do nothing.
                // If before yesterday, reset.
                // Simplifying for prototype: check simple date difference
                profile.currentStreak += 1;
            } else if (diffInHours > 48) {
                profile.currentStreak = 1;
            }
        }

        if (profile.currentStreak > profile.maxStreak) {
            profile.maxStreak = profile.currentStreak;
        }

        profile.lastActivityDate = now;
        await this.gamificationRepo.save(profile);
    }

    async getBadges(userId: string) {
        return this.userBadgeRepo.find({
            where: { userId },
            relations: ['badge'],
        });
    }

    async getAllBadges() {
        return this.badgeRepo.find();
    }
}
