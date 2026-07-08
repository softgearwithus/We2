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
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadLimitInterceptor } from '../admin-settings/interceptors/upload-limit.interceptor';

@ApiTags('ai-interviewer')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('ai-interviewer')
export class AiInterviewerController {
  constructor(private readonly aiService: AiInterviewerService) {}

  @Post('sessions')
  async createSession(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateAiInterviewDto,
  ) {
    return this.aiService.launchInterview(req.user.id, dto);
  }

  @Post('trusted-launch')
  async createTrustedLaunch(@Request() req: AuthenticatedRequest) {
    return this.aiService.createTrustedLaunchUrl(req.user.id);
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
