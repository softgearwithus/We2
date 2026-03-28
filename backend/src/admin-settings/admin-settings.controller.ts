import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Public } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { AdminSettingsService } from './admin-settings.service';
import { UpdateUpdateFlagsDto } from './dto/update-update-flags.dto';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { UpdateAdminSecurityDto } from './dto/update-admin-security.dto';

@ApiTags('admin-settings')
@Controller('admin')
export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  @Get('updates')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get update flags for dashboard indicators (Admin)',
  })
  async getUpdateFlags() {
    return this.adminSettingsService.getUpdateFlags();
  }

  @Put('updates')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update dashboard indicator flags (Admin)' })
  async updateUpdateFlags(@Body() dto: UpdateUpdateFlagsDto) {
    return this.adminSettingsService.updateUpdateFlags(dto);
  }

  @Public()
  @Get('public/updates')
  @ApiOperation({
    summary: 'Get update flags for dashboard indicators (Public)',
  })
  async getPublicUpdateFlags() {
    return this.adminSettingsService.getPublicUpdateFlags();
  }

  @Public()
  @Get('public/settings')
  @ApiOperation({ summary: 'Get public platform settings' })
  async getPublicSettings() {
    return this.adminSettingsService.getPublicPlatformSettings();
  }

  @Public()
  @Get('public/pricing-context')
  @ApiOperation({ summary: 'Get pricing display context by requester region' })
  async getPublicPricingContext(@Headers() headers: Record<string, unknown>) {
    return this.adminSettingsService.getPublicPricingContext(headers);
  }

  @Get('settings/platform')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get platform settings (Admin)' })
  async getPlatformSettings() {
    return this.adminSettingsService.getPlatformSettings();
  }

  @Patch('settings/platform')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update platform settings (Admin)' })
  async updatePlatformSettings(@Body() dto: UpdatePlatformSettingsDto) {
    return this.adminSettingsService.updatePlatformSettings(dto);
  }

  @Post('settings/platform/free-tier-refresh')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Refresh free tier limits for all users (Admin)' })
  async refreshFreeTier() {
    return this.adminSettingsService.refreshFreeTierResetAt();
  }

  @Patch('settings/profile')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update admin profile (Admin)' })
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateAdminProfileDto,
  ) {
    return this.adminSettingsService.updateAdminProfile(req.user.id, dto);
  }

  @Patch('settings/security')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update admin security settings (Admin)' })
  async updateSecurity(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateAdminSecurityDto,
  ) {
    return this.adminSettingsService.updateAdminSecurity(req.user.id, dto);
  }
}
