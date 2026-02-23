import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUpdateFlag } from './entities/admin-update-flag.entity';
import { PlatformSettings } from './entities/platform-settings.entity';
import { UpdateUpdateFlagsDto } from './dto/update-update-flags.dto';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { UpdateAdminSecurityDto } from './dto/update-admin-security.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';

@Injectable()
export class AdminSettingsService {
    constructor(
        @InjectRepository(AdminUpdateFlag)
        private updateFlagsRepo: Repository<AdminUpdateFlag>,
        @InjectRepository(PlatformSettings)
        private platformRepo: Repository<PlatformSettings>,
        private usersService: UsersService,
    ) { }

    async getUpdateFlags() {
        return this.updateFlagsRepo.find({ order: { href: 'ASC' } });
    }

    async updateUpdateFlags(payload: UpdateUpdateFlagsDto) {
        const existing = await this.updateFlagsRepo.find();
        const existingByHref = new Map(existing.map((flag) => [flag.href, flag]));
        const toSave: AdminUpdateFlag[] = [];

        payload.flags.forEach((flag) => {
            const current = existingByHref.get(flag.href);
            if (current) {
                current.enabled = flag.enabled;
                toSave.push(current);
            } else {
                toSave.push(
                    this.updateFlagsRepo.create({
                        href: flag.href,
                        enabled: flag.enabled,
                    }),
                );
            }
        });

        return this.updateFlagsRepo.save(toSave);
    }

    async getPublicUpdateFlags() {
        return this.updateFlagsRepo.find({ select: ['href', 'enabled'] });
    }

    async getPlatformSettings() {
        let settings = await this.platformRepo.findOne({ where: {} });
        if (!settings) {
            settings = this.platformRepo.create({
                maintenanceMode: false,
                allowRegistrations: true,
                supportEmail: '',
                maxUploadSizeMB: 10,
            });
            settings = await this.platformRepo.save(settings);
        }
        return settings;
    }

    async updatePlatformSettings(dto: UpdatePlatformSettingsDto) {
        const settings = await this.getPlatformSettings();
        Object.assign(settings, dto);
        return this.platformRepo.save(settings);
    }

    async updateAdminProfile(userId: string, dto: UpdateAdminProfileDto) {
        const updatePayload: any = {};
        if (dto.email !== undefined) updatePayload.email = dto.email;
        if (dto.fullName !== undefined) {
            const parts = dto.fullName.split(' ').filter(Boolean);
            updatePayload.firstName = parts.shift() || '';
            updatePayload.lastName = parts.join(' ') || '';
        }
        if (dto.avatarUrl !== undefined) updatePayload.avatarUrl = dto.avatarUrl;
        if (dto.timezone !== undefined) updatePayload.timezone = dto.timezone;
        return this.usersService.update(userId, updatePayload);
    }

    async updateAdminSecurity(userId: string, dto: UpdateAdminSecurityDto) {
        if (dto.newPassword) {
            if (!dto.currentPassword) {
                throw new BadRequestException('Current password is required.');
            }
            const user = await this.usersService.findById(userId);
            const userWithPassword = await this.usersService.findByEmail(user.email);
            if (!userWithPassword) {
                throw new NotFoundException('User not found.');
            }
            const isValid = await this.usersService.validatePassword(
                dto.currentPassword,
                userWithPassword.password,
            );
            if (!isValid) {
                throw new BadRequestException('Current password is incorrect.');
            }
            await this.usersService.update(userId, { password: dto.newPassword });
        }

        if (typeof dto.twoFactorEnabled === 'boolean') {
            await this.usersService.update(userId, { isTwoFactorEnabled: dto.twoFactorEnabled } as any);
        }

        return { success: true };
    }

    async getPublicPlatformSettings() {
        const settings = await this.getPlatformSettings();
        return {
            maintenanceMode: settings.maintenanceMode,
            allowRegistrations: settings.allowRegistrations,
            supportEmail: settings.supportEmail,
            maxUploadSizeMB: settings.maxUploadSizeMB,
        };
    }

    async ensureMaintenanceAllowed(path: string, role?: UserRole) {
        if (role && [UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN].includes(role)) {
            return;
        }
        const settings = await this.getPlatformSettings();
        if (settings.maintenanceMode) {
            throw new BadRequestException('Platform is under maintenance.');
        }
        if (!settings.allowRegistrations && path.includes('/auth/register')) {
            throw new BadRequestException('Registrations are disabled.');
        }
    }
}
