import { Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsageService } from './usage.service';
import type { UsageSectionKey } from './usage.constants';

@ApiTags('usage')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('usage')
export class UsageController {
    constructor(private readonly usageService: UsageService) { }

    @Get('sections/:sectionKey')
    @ApiOperation({ summary: 'Get usage state for a section' })
    async getSectionUsage(@Request() req: any, @Param('sectionKey') sectionKey: UsageSectionKey) {
        return this.usageService.getUsageState(req.user.id, sectionKey);
    }

    @Post('sections/:sectionKey/start')
    @ApiOperation({ summary: 'Start usage tracking for a section' })
    async startSection(@Request() req: any, @Param('sectionKey') sectionKey: UsageSectionKey) {
        return this.usageService.startSession(req.user.id, sectionKey);
    }

    @Post('sections/:sectionKey/heartbeat')
    @ApiOperation({ summary: 'Heartbeat usage for a section' })
    async heartbeat(@Request() req: any, @Param('sectionKey') sectionKey: UsageSectionKey) {
        return this.usageService.heartbeat(req.user.id, sectionKey);
    }

    @Post('sections/:sectionKey/stop')
    @ApiOperation({ summary: 'Stop usage tracking for a section' })
    async stopSection(@Request() req: any, @Param('sectionKey') sectionKey: UsageSectionKey) {
        return this.usageService.stopSession(req.user.id, sectionKey);
    }
}
