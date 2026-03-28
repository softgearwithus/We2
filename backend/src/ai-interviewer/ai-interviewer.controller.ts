import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiInterviewerService } from './ai-interviewer.service';
import { CreateAiInterviewDto } from './dto/create-ai-interview.dto';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadLimitInterceptor } from '../admin-settings/interceptors/upload-limit.interceptor';

@ApiTags('ai-interviewer')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('ai-interviewer')
export class AiInterviewerController {
  constructor(
    private readonly aiService: AiInterviewerService,
    private readonly configService: ConfigService,
  ) {}

  @Post('sessions')
  async createSession(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateAiInterviewDto,
  ) {
    const session = await this.aiService.createSession(req.user.id, dto);
    const aiBase = this.configService.get<string>('AI_INTERVIEW_BASE_URL');
    const aiKey = this.configService.get<string>('AI_INTERVIEW_INTERNAL_KEY');
    if (aiBase && aiKey) {
      try {
        const res = await fetch(`${aiBase}/ai-interview/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-key': aiKey,
          },
          body: JSON.stringify({
            interview_session_id: session.interviewSessionId,
            user_id: session.userId,
            resume_id: session.resumeId,
          }),
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.id) {
            await this.aiService.saveExternalId(session.id, data.id);
            session.externalSessionId = data.id;
          }
        }
      } catch {
        // ignore
      }
    }
    return {
      ...session,
      externalSessionId: session.externalSessionId,
    };
  }

  @Get('sessions/:id/report')
  async getReport(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.aiService.getReport(id, req.user.id);
  }

  @Post('sessions/:id/start')
  async startSession(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.aiService.startSession(id, req.user.id);
  }

  @Post('resumes')
  @UseInterceptors(FileInterceptor('file'), UploadLimitInterceptor)
  async uploadResume(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.aiService.uploadResume(req.user.id, file);
  }
}
