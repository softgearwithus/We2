import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';

@Controller('resume')
export class ResumeController {
    constructor(private readonly resumeService: ResumeService) { }

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
