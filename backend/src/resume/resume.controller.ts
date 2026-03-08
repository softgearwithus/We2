import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Body, Get, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SaveResumeDto } from './dto/save-resume.dto';
import { RequireSectionUsage } from '../usage/guards/usage.guard';
import { USAGE_SECTION_KEYS } from '../usage/usage.constants';
import { UploadLimitInterceptor } from '../admin-settings/interceptors/upload-limit.interceptor';
import { UsageGuard } from '../usage/guards/usage.guard';

@ApiTags('resume')
@Controller('resume')
export class ResumeController {
    constructor(private readonly resumeService: ResumeService) { }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, UsageGuard)
    @Get('me')
    @ApiOperation({ summary: 'Get my saved resume' })
    @ApiResponse({ status: 200, description: 'Resume data retrieved' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.RESUME)
    async getMyResume(@Request() req: any) {
        return this.resumeService.getResumeByUser(req.user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, UsageGuard)
    @Post('me')
    @ApiOperation({ summary: 'Save my resume' })
    @ApiResponse({ status: 200, description: 'Resume saved' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.RESUME)
    async saveMyResume(@Request() req: any, @Body() body: SaveResumeDto) {
        return this.resumeService.saveResume(req.user.id, body.data);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, UsageGuard)
    @Post('analyze')
    @UseInterceptors(FileInterceptor('file'), UploadLimitInterceptor)
    @RequireSectionUsage(USAGE_SECTION_KEYS.RESUME)
    async analyzeResume(
        @Request() req: any,
        @UploadedFile() file: any,
        @Body('jobDescription') jobDescription?: string
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        return this.resumeService.analyzeResume(req.user.id, file.buffer, jobDescription);
    }
}
