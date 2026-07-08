import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { InviteCandidateDto } from './dto/invite-candidate.dto';
import { UpdateCandidateReviewDto } from './dto/update-candidate-review.dto';
import { UpdateApplicationScreeningDto } from './dto/update-application-screening.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { CompanyScopeService } from '../company-settings/company-scope.service';
import { UploadLimitInterceptor } from '../admin-settings/interceptors/upload-limit.interceptor';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly companyScope: CompanyScopeService,
  ) {}

  @Post()
  @Roles(UserRole.STUDENT)
  apply(
    @Request() req: AuthenticatedRequest,
    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    return this.applicationsService.apply(req.user.id, createApplicationDto);
  }

  @Post('apply-with-resume')
  @Roles(UserRole.STUDENT)
  @UseInterceptors(FileInterceptor('resumeFile'), UploadLimitInterceptor)
  applyWithResume(
    @Request() req: AuthenticatedRequest,
    @Body() createApplicationDto: CreateApplicationDto,
    @UploadedFile() resumeFile?: Express.Multer.File,
  ) {
    return this.applicationsService.apply(
      req.user.id,
      createApplicationDto,
      resumeFile,
    );
  }

  @Post(':id/resume')
  @Roles(UserRole.STUDENT)
  @UseInterceptors(FileInterceptor('resumeFile'), UploadLimitInterceptor)
  replaceResume(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @UploadedFile() resumeFile?: Express.Multer.File,
  ) {
    return this.applicationsService.replaceResume(req.user.id, id, resumeFile);
  }

  @Get('my')
  @Roles(UserRole.STUDENT)
  findMyApplications(@Request() req: AuthenticatedRequest) {
    return this.applicationsService.findMyApplications(req.user.id);
  }

  @Get('drive/:driveId')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN)
  async findByPlacement(
    @Request() req: AuthenticatedRequest,
    @Param('driveId') driveId: string,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.applicationsService.findByPlacement(
      driveId,
      actorId,
      req.user.role,
    );
  }

  @Post('drive/:driveId/invites')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN)
  async inviteCandidate(
    @Request() req: AuthenticatedRequest,
    @Param('driveId') driveId: string,
    @Body() inviteDto: InviteCandidateDto,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.applicationsService.inviteCandidate(
      driveId,
      actorId,
      req.user.role,
      inviteDto,
    );
  }

  @Get(':id/review')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN)
  async findReview(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.applicationsService.findReview(
      id,
      actorId,
      req.user.role,
    );
  }

  @Patch(':id/review')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN)
  async updateReview(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateCandidateReviewDto,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.applicationsService.updateReview(
      id,
      actorId,
      req.user.role,
      updateReviewDto,
    );
  }

  @Patch(':id/status')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN)
  async updateStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.applicationsService.updateStatus(
      id,
      status,
      actorId,
      req.user.role,
    );
  }

  @Patch(':id/screening')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN)
  async updateScreening(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateScreeningDto: UpdateApplicationScreeningDto,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.applicationsService.updateScreening(
      id,
      actorId,
      req.user.role,
      updateScreeningDto,
    );
  }

  @Post(':id/interview/retry')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN)
  async retryInterview(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.applicationsService.retryInterview(
      id,
      actorId,
      req.user.role,
    );
  }
}
