import {
  Controller,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InterviewService } from './interview.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireSectionUsage } from '../usage/guards/usage.guard';
import { USAGE_SECTION_KEYS } from '../usage/usage.constants';
import { UploadLimitInterceptor } from '../admin-settings/interceptors/upload-limit.interceptor';
import { InterviewsService } from '../interviews/interviews.service';
import { InterviewDifficulty } from '../interviews/entities/interview-session.entity';

@Controller('interview')
export class InterviewController {
  constructor(
    private readonly interviewService: InterviewService,
    private readonly interviewsService: InterviewsService,
  ) {}

  @Post('start')
  startSession(@Body('userId') userId: string) {
    return this.interviewService.startSession(userId || 'guest'); // Allow guest for now
  }

  @Post(':id/message')
  sendMessage(@Param('id') id: string, @Body('message') message: string) {
    return this.interviewService.processMessage(id, message);
  }

  @Post('analyze-audio')
  @UseInterceptors(FileInterceptor('audio'), UploadLimitInterceptor)
  async analyzeAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const type = body.type;
    const referenceText = body.referenceText;

    return {
      feedback: await this.interviewService.analyzeAudio(
        file.buffer,
        file.mimetype,
        type,
        referenceText,
      ),
    };
  }

  @Post(':id/end')
  endSession(@Param('id') id: string) {
    return this.interviewService.endSession(id);
  }

  @Post('vapi/analysis')
  @UseGuards(JwtAuthGuard)
  @RequireSectionUsage(USAGE_SECTION_KEYS.INTERVIEW_VIDEO)
  async getVapiAnalysis(@Body('callId') callId: string, @Request() req: any) {
    return this.interviewService.getVapiAnalysis(callId, req.user?.id);
  }
  @Post('vapi/resumes')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'), UploadLimitInterceptor)
  @RequireSectionUsage(USAGE_SECTION_KEYS.INTERVIEW_VIDEO)
  async uploadVapiResume(
    @Request() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.interviewService.uploadVapiResume(req.user.id, file);
  }

  @Post('vapi/sessions')
  @UseGuards(JwtAuthGuard)
  @RequireSectionUsage(USAGE_SECTION_KEYS.INTERVIEW_VIDEO)
  async createVapiSession(
    @Request() req: any,
    @Body()
    body: { resumeAssetId?: string; role?: string; difficulty?: InterviewDifficulty },
  ) {
    await this.interviewsService.deductCredit(req.user.id, 'video');
    return this.interviewService.createVapiInterviewSession(
      req.user.id,
      body?.resumeAssetId || null,
      { role: body?.role, difficulty: body?.difficulty },
    );
  }

  @Get('vapi/sessions/:id/report')
  @UseGuards(JwtAuthGuard)
  async getVapiReport(@Request() req: any, @Param('id') id: string) {
    return this.interviewService.getVapiReportForSession(id, req.user?.id);
  }
}
