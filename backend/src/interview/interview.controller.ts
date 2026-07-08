import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import {
  Controller,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InterviewService } from './interview.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadLimitInterceptor } from '../admin-settings/interceptors/upload-limit.interceptor';
import { InterviewsService } from '../interviews/interviews.service';

@Controller('interview')
export class InterviewController {
  constructor(
    private readonly interviewService: InterviewService,
    private readonly interviewsService: InterviewsService,
  ) {}

  @Post('start')
  @UseGuards(JwtAuthGuard)
  async startSession(@Request() req: AuthenticatedRequest) {
    await this.interviewsService.deductCredit(req.user.id, 'audio');
    return this.interviewService.startSession(req.user.id);
  }

  @Post(':id/message')
  @UseGuards(JwtAuthGuard)
  sendMessage(
    @Param('id') id: string,
    @Body('message') message: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.interviewService.processMessage(id, message, req.user.id);
  }

  @Post('analyze-audio')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('audio'), UploadLimitInterceptor)
  async analyzeAudio(
    @Request() req: AuthenticatedRequest,
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
  @UseGuards(JwtAuthGuard)
  endSession(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.interviewService.endSession(id, req.user.id);
  }
}
