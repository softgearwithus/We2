import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TestSeriesService } from './test-series.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, CurrentUser } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  BulkQuestionsDto,
  SubmitMockTestDto,
  SubmitSubjectPracticeDto,
} from './dto/test-series.dto';

@ApiTags('test-series')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('test-series')
export class TestSeriesController {
  constructor(private readonly testSeriesService: TestSeriesService) {}

  // --- Student Endpoints ---
  @Get('student/companies')
  @Roles(UserRole.STUDENT, UserRole.MENTOR, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List active companies for students' })
  getStudentCompanies() {
    return this.testSeriesService.getCompanies(true);
  }

  @Get('student/companies/:id/hierarchy')
  @Roles(UserRole.STUDENT, UserRole.MENTOR, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get full mock tests hierarchy for a company' })
  getCompanyHierarchy(@Param('id') id: string, @CurrentUser() user: any) {
    const isStudent = user.role !== UserRole.SUPER_ADMIN;
    return this.testSeriesService.getCompanyHierarchy(id, isStudent);
  }

  @Get('student/mock-tests/:id')
  @Roles(UserRole.STUDENT, UserRole.MENTOR, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get the full test data for a mock test session' })
  getMockTestFull(@Param('id') id: string, @CurrentUser() user: any) {
    const isStudent = user.role !== UserRole.SUPER_ADMIN;
    return this.testSeriesService.getMockTestFull(id, isStudent);
  }

  @Get('student/results')
  @Roles(UserRole.STUDENT, UserRole.MENTOR, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List student mock test results' })
  getStudentResults(@CurrentUser() user: any) {
    return this.testSeriesService.getStudentResults(user.userId || user.id);
  }

  @Post('student/mock-tests/:id/submit')
  @Roles(UserRole.STUDENT, UserRole.MENTOR, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Submit a mock test and evaluate results' })
  async submitMockTest(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: SubmitMockTestDto,
  ) {
    try {
      return await this.testSeriesService.submitTest(
        user.userId || user.id,
        id,
        body,
      );
    } catch (error: any) {
      console.error('CRITICAL SUBMIT ERROR:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Submission crash',
          message: error?.message || 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('student/results/subject')
  @Roles(UserRole.STUDENT, UserRole.MENTOR, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Submit a subject practice module and get a mock test result',
  })
  async submitSubjectPractice(
    @CurrentUser() user: any,
    @Body() body: SubmitSubjectPracticeDto,
  ) {
    try {
      return await this.testSeriesService.submitSubjectPractice(
        user.userId || user.id,
        body,
      );
    } catch (error: any) {
      console.error('CRITICAL SUBMIT ERROR:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Submission crash',
          message: error?.message || 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('student/results/:id')
  @Roles(UserRole.STUDENT, UserRole.MENTOR, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary:
      'Get the detailed analysis results for a completed mock test session',
  })
  getResultFull(@CurrentUser() user: any, @Param('id') id: string) {
    return this.testSeriesService.getResultFull(id, user.userId || user.id);
  }

  // --- Admin Endpoints ---
  @Get('admin/companies')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all companies (Admin)' })
  getAdminCompanies() {
    return this.testSeriesService.getCompanies(false);
  }

  @Post('admin/companies')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a company (Admin)' })
  createCompany(@Body() dto: CreateCompanyDto) {
    return this.testSeriesService.createCompany(dto);
  }

  @Patch('admin/companies/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a company (Admin)' })
  updateCompany(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.testSeriesService.updateCompany(id, dto);
  }

  @Delete('admin/companies/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a company (Admin)' })
  deleteCompany(@Param('id') id: string) {
    return this.testSeriesService.deleteCompany(id);
  }

  @Post('admin/mock-tests')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a mock test' })
  createMockTest(@Body() dto: any) {
    return this.testSeriesService.createMockTest(dto);
  }

  @Patch('admin/mock-tests/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a mock test' })
  updateMockTest(@Param('id') id: string, @Body() dto: any) {
    return this.testSeriesService.updateMockTest(id, dto);
  }

  @Delete('admin/mock-tests/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a mock test' })
  deleteMockTest(@Param('id') id: string) {
    return this.testSeriesService.deleteMockTest(id);
  }

  @Patch('admin/mock-tests/:id/publish')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Publish or unpublish a mock test to students' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { isPublished: { type: 'boolean' } },
    },
  })
  publishMockTest(
    @Param('id') id: string,
    @Body('isPublished') isPublished: boolean,
  ) {
    return this.testSeriesService.publishMockTest(id, isPublished);
  }

  @Post('admin/sections')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a section' })
  createSection(@Body() dto: any) {
    return this.testSeriesService.createSection(dto);
  }

  @Patch('admin/sections/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a section' })
  updateSection(@Param('id') id: string, @Body() dto: any) {
    return this.testSeriesService.updateSection(id, dto);
  }

  @Delete('admin/sections/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a section' })
  deleteSection(@Param('id') id: string) {
    return this.testSeriesService.deleteSection(id);
  }

  @Get('admin/sections/:id/questions')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all questions for a section' })
  getSectionQuestions(@Param('id') id: string) {
    return this.testSeriesService.getSectionQuestions(id);
  }

  @Delete('admin/questions/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a specific question' })
  deleteQuestion(@Param('id') id: string) {
    return this.testSeriesService.deleteQuestion(id);
  }

  @Post('admin/upload-image')
  @Roles(UserRole.SUPER_ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/test-series',
        filename: (req: AuthenticatedRequest, file: any, cb: any) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  @ApiOperation({ summary: 'Upload an image for a question' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const fileUrl = `/uploads/test-series/${file.filename}`;
    return { url: fileUrl };
  }

  @Post('admin/sections/:id/bulk-questions')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Instantly populate a section with a bulk JSON array of questions',
  })
  importBulkQuestions(@Param('id') id: string, @Body() dto: BulkQuestionsDto) {
    if (!dto.questions || !Array.isArray(dto.questions)) {
      throw new Error('Must provide a "questions" array in the body');
    }
    return this.testSeriesService.importBulkQuestions(id, dto.questions);
  }
}
