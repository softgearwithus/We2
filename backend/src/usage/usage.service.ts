import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSectionUsage } from './entities/user-section-usage.entity';
import { UsageSectionKey, USAGE_RESET_INTERVAL_DAYS } from './usage.constants';
import { UsersService } from '../users/users.service';
import { AdminSettingsService } from '../admin-settings/admin-settings.service';

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
        private adminSettingsService: AdminSettingsService,
    ) { }

    private async getLimitSecondsForPlan(plan: string | null | undefined) {
        // Handle duration-based tags (standard_1m, pro_3m, etc.) and top level plan names
        if (plan && (plan.startsWith('standard') || plan.startsWith('pro') || plan === 'placement_plus' || plan === 'we2_max' || plan.includes('standard') || plan.includes('pro'))) {
            return Infinity;
        }

        const settings = await this.adminSettingsService.getPlatformSettings();
        console.log('[DEBUG] getLimitSecondsForPlan - fetched settings:', settings.freeTierLimitMinutes, settings.freeTierResetAt);
        return (settings.freeTierLimitMinutes || 10) * 60;
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
            try {
                record = await this.usageRepo.save(record);
            } catch (error) {
                if (error?.code === '23505') {
                    record = await this.usageRepo.findOne({ where: { userId, sectionKey } });
                    if (!record) throw error;
                } else {
                    throw error;
                }
            }
        }
        return record;
    }

    private async resetIfNeeded(record: UserSectionUsage) {
        const now = new Date();
        const settings = await this.adminSettingsService.getPlatformSettings();

        let forceReset = false;
        if (settings.freeTierResetAt && (!record.lastResetAt || new Date(settings.freeTierResetAt).getTime() > new Date(record.lastResetAt).getTime())) {
            forceReset = true;
        }

        if (!record.lastResetAt || forceReset) {
            record.usedSeconds = 0;
            record.lastResetAt = now;
            record.lastHeartbeatAt = null;
            record.isActive = false;
            return this.usageRepo.save(record);
        }

        const elapsedMs = now.getTime() - new Date(record.lastResetAt).getTime();
        const resetWindowMs = USAGE_RESET_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
        if (elapsedMs >= resetWindowMs) {
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
        const limitSeconds = await this.getLimitSecondsForPlan(user.subscriptionPlan);
        return this.buildState(resetRecord, limitSeconds);
    }

    async startSession(userId: string, sectionKey: UsageSectionKey): Promise<UsageState> {
        const user = await this.usersService.findById(userId);
        const record = await this.ensureRecord(userId, sectionKey);
        const resetRecord = await this.resetIfNeeded(record);
        const limitSeconds = await this.getLimitSecondsForPlan(user.subscriptionPlan);
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
        const limitSeconds = await this.getLimitSecondsForPlan(user.subscriptionPlan);

        if (!resetRecord.isActive) {
            resetRecord.isActive = true;
            resetRecord.lastHeartbeatAt = new Date();
            await this.usageRepo.save(resetRecord);
            return this.buildState(resetRecord, limitSeconds);
        }

        if (limitSeconds === Infinity) {
            resetRecord.lastHeartbeatAt = new Date();
            resetRecord.isActive = true;
            await this.usageRepo.save(resetRecord);
            return this.buildState(resetRecord, limitSeconds);
        }

        const now = new Date();
        const lastBeat = resetRecord.lastHeartbeatAt ? new Date(resetRecord.lastHeartbeatAt) : null;

        if (lastBeat) {
            const deltaMs = now.getTime() - lastBeat.getTime();
            if (deltaMs >= 1000) {
                const deltaSeconds = Math.floor(deltaMs / 1000);
                resetRecord.usedSeconds = Math.min(limitSeconds, resetRecord.usedSeconds + deltaSeconds);
                resetRecord.lastHeartbeatAt = new Date(lastBeat.getTime() + deltaSeconds * 1000);
            } else if (deltaMs < 0) {
                resetRecord.lastHeartbeatAt = now;
            }
        } else {
            resetRecord.lastHeartbeatAt = now;
        }

        resetRecord.isActive = true;
        await this.usageRepo.save(resetRecord);
        return this.buildState(resetRecord, limitSeconds);
    }

    async stopSession(userId: string, sectionKey: UsageSectionKey): Promise<UsageState> {
        const user = await this.usersService.findById(userId);
        const record = await this.ensureRecord(userId, sectionKey);
        const resetRecord = await this.resetIfNeeded(record);
        const limitSeconds = await this.getLimitSecondsForPlan(user.subscriptionPlan);

        if (limitSeconds !== Infinity) {
            const now = new Date();
            const lastBeat = resetRecord.lastHeartbeatAt ? new Date(resetRecord.lastHeartbeatAt) : null;
            let deltaSeconds = 0;
            if (lastBeat) {
                deltaSeconds = Math.max(0, Math.floor((now.getTime() - lastBeat.getTime()) / 1000));
            }
            resetRecord.usedSeconds = Math.min(limitSeconds, resetRecord.usedSeconds + deltaSeconds);
        }

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
