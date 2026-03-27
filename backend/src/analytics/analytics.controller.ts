import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('analytics')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get aggregated dashboard stats for user' })
  async getDashboardStats(@Request() req: any) {
    return this.analyticsService.getUserDashboardStats(req.user.id);
  }

  @Get('heatmap')
  @ApiOperation({ summary: 'Get submission activity heatmap' })
  async getHeatmap(@Request() req: any) {
    return this.analyticsService.getHeatmapData(req.user.id);
  }

  @Get('skills')
  @ApiOperation({ summary: 'Get skill radar data based on solved tags' })
  async getSkills(@Request() req: any) {
    return this.analyticsService.getSkillRadar(req.user.id);
  }
}
