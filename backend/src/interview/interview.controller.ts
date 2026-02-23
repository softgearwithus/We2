import { Controller, Post, Body, Param, UseInterceptors, UploadedFile, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InterviewService } from './interview.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireSectionUsage } from '../usage/guards/usage.guard';
import { USAGE_SECTION_KEYS } from '../usage/usage.constants';
import { UploadLimitInterceptor } from '../admin-settings/interceptors/upload-limit.interceptor';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) { }

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
      feedback: await this.interviewService.analyzeAudio(file.buffer, file.mimetype, type, referenceText),
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
}
