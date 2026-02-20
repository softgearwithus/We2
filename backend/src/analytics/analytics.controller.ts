import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('analytics')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

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

    @Get('institute/dashboard')
    @ApiOperation({ summary: 'Get institute dashboard snapshot' })
    async getInstituteDashboard(@Request() req: any) {
        return this.analyticsService.getInstituteDashboard(req.user?.collegeId);
    }

    @Get('institute/students')
    @ApiOperation({ summary: 'Get institute student list (filtered)' })
    async getInstituteStudents(
        @Request() req: any,
        @Query('query') query?: string,
        @Query('department') department?: string,
        @Query('year') year?: string,
        @Query('status') status?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.analyticsService.getInstituteStudents({
            collegeId: req.user?.collegeId,
            query,
            department: department || undefined,
            year: year ? parseInt(year, 10) : undefined,
            status: status || undefined,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }

    @Get('institute/placements')
    @ApiOperation({ summary: 'Get institute placement metrics' })
    async getInstitutePlacements(@Request() req: any) {
        return this.analyticsService.getInstitutePlacements(req.user?.collegeId);
    }
}
