import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Body, Get, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SaveResumeDto } from './dto/save-resume.dto';

@ApiTags('resume')
@Controller('resume')
export class ResumeController {
    constructor(private readonly resumeService: ResumeService) { }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiOperation({ summary: 'Get my saved resume' })
    @ApiResponse({ status: 200, description: 'Resume data retrieved' })
    async getMyResume(@Request() req: any) {
        return this.resumeService.getResumeByUser(req.user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('me')
    @ApiOperation({ summary: 'Save my resume' })
    @ApiResponse({ status: 200, description: 'Resume saved' })
    async saveMyResume(@Request() req: any, @Body() body: SaveResumeDto) {
        return this.resumeService.saveResume(req.user.id, body.data);
    }

    @Post('analyze')
    @UseInterceptors(FileInterceptor('file'))
    async analyzeResume(
        @UploadedFile() file: any,
        @Body('jobDescription') jobDescription?: string
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        return this.resumeService.analyzeResume(file.buffer, jobDescription);
    }
}
