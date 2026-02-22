import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSectionUsage } from './entities/user-section-usage.entity';
import { FREE_PLAN_SECTION_LIMIT_SECONDS, UsageSectionKey } from './usage.constants';
import { UsersService } from '../users/users.service';

type UsageState = {
    remainingSeconds: number;
    usedSeconds: number;
    limitSeconds: number;
    isLimited: boolean;
    lastResetAt: Date | null;
};

@Injectable()
export class UsageService {
    constructor(
        @InjectRepository(UserSectionUsage)
        private usageRepo: Repository<UserSectionUsage>,
        private usersService: UsersService,
    ) { }

    private getMonthKey(date: Date) {
        return `${date.getFullYear()}-${date.getMonth()}`;
    }

    private getLimitSecondsForPlan(plan: string | null | undefined) {
        if (!plan || plan === 'free') {
            return FREE_PLAN_SECTION_LIMIT_SECONDS;
        }
        return Infinity;
    }

    private async ensureRecord(userId: string, sectionKey: UsageSectionKey) {
        let record = await this.usageRepo.findOne({ where: { userId, sectionKey } });
        if (!record) {
            record = this.usageRepo.create({
                userId,
                sectionKey,
                usedSeconds: 0,
                lastResetAt: null,
                lastHeartbeatAt: null,
                isActive: false,
            });
            record = await this.usageRepo.save(record);
        }
        return record;
    }

    private async resetIfNeeded(record: UserSectionUsage) {
        const now = new Date();
        if (!record.lastResetAt) {
            record.usedSeconds = 0;
            record.lastResetAt = now;
            record.lastHeartbeatAt = null;
            record.isActive = false;
            return this.usageRepo.save(record);
        }
        const lastKey = this.getMonthKey(record.lastResetAt);
        const nowKey = this.getMonthKey(now);
        if (lastKey !== nowKey) {
            record.usedSeconds = 0;
            record.lastResetAt = now;
            record.lastHeartbeatAt = null;
            record.isActive = false;
            return this.usageRepo.save(record);
        }
        return record;
    }

    private buildState(record: UserSectionUsage, limitSeconds: number): UsageState {
        const usedSeconds = Math.max(0, record.usedSeconds || 0);
        const remainingSeconds = limitSeconds === Infinity
            ? limitSeconds
            : Math.max(0, limitSeconds - usedSeconds);
        return {
            remainingSeconds,
            usedSeconds,
            limitSeconds,
            isLimited: limitSeconds !== Infinity && remainingSeconds <= 0,
            lastResetAt: record.lastResetAt,
        };
    }

    async getUsageState(userId: string, sectionKey: UsageSectionKey): Promise<UsageState> {
        const user = await this.usersService.findById(userId);
        const record = await this.ensureRecord(userId, sectionKey);
        const resetRecord = await this.resetIfNeeded(record);
        const limitSeconds = this.getLimitSecondsForPlan(user.subscriptionPlan);
        return this.buildState(resetRecord, limitSeconds);
    }

    async startSession(userId: string, sectionKey: UsageSectionKey): Promise<UsageState> {
        const user = await this.usersService.findById(userId);
        const record = await this.ensureRecord(userId, sectionKey);
        const resetRecord = await this.resetIfNeeded(record);
        const limitSeconds = this.getLimitSecondsForPlan(user.subscriptionPlan);
        if (limitSeconds !== Infinity && resetRecord.usedSeconds >= limitSeconds) {
            throw new BadRequestException('Free plan limit reached for this section.');
        }
        resetRecord.isActive = true;
        resetRecord.lastHeartbeatAt = new Date();
        await this.usageRepo.save(resetRecord);
        return this.buildState(resetRecord, limitSeconds);
    }

    async heartbeat(userId: string, sectionKey: UsageSectionKey): Promise<UsageState> {
        const user = await this.usersService.findById(userId);
        const record = await this.ensureRecord(userId, sectionKey);
        const resetRecord = await this.resetIfNeeded(record);
        const limitSeconds = this.getLimitSecondsForPlan(user.subscriptionPlan);
        if (limitSeconds === Infinity) {
            resetRecord.lastHeartbeatAt = new Date();
            resetRecord.isActive = true;
            await this.usageRepo.save(resetRecord);
            return this.buildState(resetRecord, limitSeconds);
        }

        const now = new Date();
        const lastBeat = resetRecord.lastHeartbeatAt ? new Date(resetRecord.lastHeartbeatAt) : null;
        let deltaSeconds = 0;
        if (lastBeat) {
            deltaSeconds = Math.max(0, Math.floor((now.getTime() - lastBeat.getTime()) / 1000));
        }
        resetRecord.usedSeconds = Math.min(limitSeconds, resetRecord.usedSeconds + deltaSeconds);
        resetRecord.lastHeartbeatAt = now;
        resetRecord.isActive = true;
        await this.usageRepo.save(resetRecord);
        return this.buildState(resetRecord, limitSeconds);
    }

    async stopSession(userId: string, sectionKey: UsageSectionKey): Promise<UsageState> {
        const user = await this.usersService.findById(userId);
        const record = await this.ensureRecord(userId, sectionKey);
        const resetRecord = await this.resetIfNeeded(record);
        const limitSeconds = this.getLimitSecondsForPlan(user.subscriptionPlan);
        resetRecord.isActive = false;
        resetRecord.lastHeartbeatAt = null;
        await this.usageRepo.save(resetRecord);
        return this.buildState(resetRecord, limitSeconds);
    }

    async assertAllowed(userId: string, sectionKey: UsageSectionKey) {
        const state = await this.getUsageState(userId, sectionKey);
        if (state.isLimited) {
            throw new BadRequestException('Free plan limit reached for this section.');
        }
        return state;
    }
}
