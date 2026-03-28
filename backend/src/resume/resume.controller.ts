import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { UploadLimitInterceptor } from '../admin-settings/interceptors/upload-limit.interceptor';

@ApiTags('resume')
@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('all')
  @ApiOperation({ summary: 'Get all saved resumes for the user' })
  @ApiResponse({ status: 200, description: 'List of resumes retrieved' })
  async getAllResumes(@Request() req: AuthenticatedRequest) {
    return this.resumeService.getAllResumes(req.user.id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific resume by ID' })
  @ApiResponse({ status: 200, description: 'Resume data retrieved' })
  async getResumeById(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.resumeService.getResumeById(id, req.user.id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new resume' })
  @ApiResponse({ status: 201, description: 'Resume created' })
  async createResume(
    @Request() req: AuthenticatedRequest,
    @Body() body: CreateResumeDto,
  ) {
    return this.resumeService.createResume(req.user.id, body.title, body.data);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update an existing resume' })
  @ApiResponse({ status: 200, description: 'Resume updated' })
  async updateResume(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateResumeDto,
  ) {
    return this.resumeService.updateResume(id, req.user.id, body);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a resume' })
  @ApiResponse({ status: 200, description: 'Resume deleted' })
  async deleteResume(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.resumeService.deleteResume(id, req.user.id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'), UploadLimitInterceptor)
  async analyzeResume(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: any,
    @Body('jobDescription') jobDescription?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.resumeService.analyzeResume(
      req.user.id,
      file.buffer,
      jobDescription,
    );
  }
}
