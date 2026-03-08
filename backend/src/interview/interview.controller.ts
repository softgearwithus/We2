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
import { UsageGuard } from '../usage/guards/usage.guard';

@Controller('interview')
export class InterviewController {
  constructor(
    private readonly interviewService: InterviewService,
    private readonly interviewsService: InterviewsService,
  ) {}

  @Post('start')
  @UseGuards(JwtAuthGuard, UsageGuard)
  @RequireSectionUsage(USAGE_SECTION_KEYS.INTERVIEW_AUDIO)
  async startSession(@Request() req: any) {
    await this.interviewsService.deductCredit(req.user.id, 'audio');
    return this.interviewService.startSession(req.user.id);
  }

  @Post(':id/message')
  @UseGuards(JwtAuthGuard, UsageGuard)
  @RequireSectionUsage(USAGE_SECTION_KEYS.INTERVIEW_AUDIO)
  sendMessage(@Param('id') id: string, @Body('message') message: string, @Request() req: any) {
    return this.interviewService.processMessage(id, message, req.user.id);
  }

  @Post('analyze-audio')
  @UseGuards(JwtAuthGuard, UsageGuard)
  @RequireSectionUsage(USAGE_SECTION_KEYS.INTERVIEW_AUDIO)
  @UseInterceptors(FileInterceptor('audio'), UploadLimitInterceptor)
  async analyzeAudio(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    await this.interviewsService.deductCredit(req.user.id, 'audio');
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
  @UseGuards(JwtAuthGuard, UsageGuard)
  @RequireSectionUsage(USAGE_SECTION_KEYS.INTERVIEW_AUDIO)
  endSession(@Param('id') id: string, @Request() req: any) {
    return this.interviewService.endSession(id, req.user.id);
  }

  @Post('vapi/analysis')
  @UseGuards(JwtAuthGuard, UsageGuard)
  @RequireSectionUsage(USAGE_SECTION_KEYS.INTERVIEW_VIDEO)
  async getVapiAnalysis(@Body('callId') callId: string, @Request() req: any) {
    return this.interviewService.getVapiAnalysis(callId, req.user?.id);
  }
  @Post('vapi/resumes')
  @UseGuards(JwtAuthGuard, UsageGuard)
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
  @UseGuards(JwtAuthGuard, UsageGuard)
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
  @UseGuards(JwtAuthGuard, UsageGuard)
  @RequireSectionUsage(USAGE_SECTION_KEYS.INTERVIEW_VIDEO)
  async getVapiReport(@Request() req: any, @Param('id') id: string) {
    return this.interviewService.getVapiReportForSession(id, req.user?.id);
  }
}
