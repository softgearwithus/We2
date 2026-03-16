import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Body, Get, UseGuards, Request, Param, Put, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
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
    @Get('all')
    @ApiOperation({ summary: 'Get all saved resumes for the user' })
    @ApiResponse({ status: 200, description: 'List of resumes retrieved' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.RESUME)
    async getAllResumes(@Request() req: any) {
        return this.resumeService.getAllResumes(req.user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, UsageGuard)
    @Get(':id')
    @ApiOperation({ summary: 'Get a specific resume by ID' })
    @ApiResponse({ status: 200, description: 'Resume data retrieved' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.RESUME)
    async getResumeById(@Request() req: any, @Param('id') id: string) {
        return this.resumeService.getResumeById(id, req.user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, UsageGuard)
    @Post()
    @ApiOperation({ summary: 'Create a new resume' })
    @ApiResponse({ status: 201, description: 'Resume created' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.RESUME)
    async createResume(@Request() req: any, @Body() body: CreateResumeDto) {
        return this.resumeService.createResume(req.user.id, body.title, body.data);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, UsageGuard)
    @Put(':id')
    @ApiOperation({ summary: 'Update an existing resume' })
    @ApiResponse({ status: 200, description: 'Resume updated' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.RESUME)
    async updateResume(@Request() req: any, @Param('id') id: string, @Body() body: UpdateResumeDto) {
        return this.resumeService.updateResume(id, req.user.id, body);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, UsageGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a resume' })
    @ApiResponse({ status: 200, description: 'Resume deleted' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.RESUME)
    async deleteResume(@Request() req: any, @Param('id') id: string) {
        return this.resumeService.deleteResume(id, req.user.id);
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
