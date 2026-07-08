import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PlacementsService } from './placements.service';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { UpdatePlacementDto } from './dto/update-placement.dto';
import { CreateHiringAssessmentDto } from './dto/create-hiring-assessment.dto';
import { UpdateHiringAssessmentDto } from './dto/update-hiring-assessment.dto';
import { GenerateHiringAssessmentDto } from './dto/generate-hiring-assessment.dto';
import { AttachHiringAssessmentDto } from './dto/attach-hiring-assessment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  PlacementType,
  PlacementStatus,
  DriveVerificationStatus,
  WorkMode,
} from './entities/placement.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public, Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { CompanyScopeService } from '../company-settings/company-scope.service';
import { ApplicationsService } from '../applications/applications.service';
import {
  RunPlacementScreeningDto,
  SchedulePlacementInterviewsDto,
} from '../applications/dto/run-placement-screening.dto';

@UseGuards(JwtAuthGuard)
@Controller('placements')
export class PlacementsController {
  constructor(
    private readonly placementsService: PlacementsService,
    private readonly companyScope: CompanyScopeService,
    private readonly applicationsService: ApplicationsService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createPlacementDto: CreatePlacementDto,
  ) {
    if (req.user.role === UserRole.COMPANY_ADMIN) {
      const companyId = await this.companyScope.resolveCompanyId(
        req.user.id,
        req.user.role,
      );
      createPlacementDto.companyId = companyId;
      if (!createPlacementDto.companyName) {
        createPlacementDto.companyName = req.user.email;
      }
    }
    return this.placementsService.create(createPlacementDto);
  }

  @Get('my-drives')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  async findMyDrives(@Request() req: AuthenticatedRequest) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.placementsService.findMyDrives(companyId);
  }

  @Get('templates/role-pipelines')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  getRoleTemplates() {
    return this.placementsService.getRoleTemplates();
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('type') type?: PlacementType,
    @Query('status') status?: PlacementStatus,
    @Query('mode') mode?: WorkMode,
  ) {
    const isSuperAdmin = req.user.role === UserRole.SUPER_ADMIN;
    return this.placementsService.findAll(type, status, isSuperAdmin, mode);
  }

  @Public()
  @Get('public/active')
  findPublicActive(
    @Query('type') type?: PlacementType,
    @Query('mode') mode?: WorkMode,
    @Query('q') q?: string,
  ) {
    return this.placementsService.findPublicActiveJobs(type, mode, q);
  }

  @Public()
  @Get('public/stats')
  getPublicStats() {
    return this.placementsService.getPublicActiveJobStats();
  }

  @Get(':id/pipeline-summary')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async getPipelineSummary(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.placementsService.getPipelineSummary(
      id,
      actorId,
      req.user.role,
    );
  }

  @Post(':id/screening/run')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async runScreening(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: RunPlacementScreeningDto,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.applicationsService.runPlacementScreening(
      id,
      actorId,
      req.user.role,
      body,
    );
  }

  @Post(':id/interviews/schedule')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async scheduleInterviews(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: SchedulePlacementInterviewsDto,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.applicationsService.schedulePlacementInterviews(
      id,
      actorId,
      req.user.role,
      body,
    );
  }

  @Get(':id/assessments')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async findAssessments(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.placementsService.findAssessments(
      id,
      actorId,
      req.user.role,
    );
  }

  @Post(':id/assessments')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async createAssessment(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() createAssessmentDto: CreateHiringAssessmentDto,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.placementsService.createAssessment(
      id,
      actorId,
      req.user.role,
      createAssessmentDto,
    );
  }

  @Post(':id/assessments/:assessmentId/attach')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async attachAssessment(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('assessmentId') assessmentId: string,
    @Body() attachAssessmentDto: AttachHiringAssessmentDto,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.placementsService.attachAssessment(
      id,
      assessmentId,
      actorId,
      req.user.role,
      attachAssessmentDto,
    );
  }

  @Post(':id/assessments/generate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async generateAssessment(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() generateAssessmentDto: GenerateHiringAssessmentDto,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.placementsService.generateAssessment(
      id,
      actorId,
      req.user.role,
      generateAssessmentDto,
    );
  }

  @Get(':id/assessments/:assessmentId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async findAssessment(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('assessmentId') assessmentId: string,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.placementsService.findAssessment(
      id,
      assessmentId,
      actorId,
      req.user.role,
    );
  }

  @Patch(':id/assessments/:assessmentId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async updateAssessment(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('assessmentId') assessmentId: string,
    @Body() updateAssessmentDto: UpdateHiringAssessmentDto,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.placementsService.updateAssessment(
      id,
      assessmentId,
      actorId,
      req.user.role,
      updateAssessmentDto,
    );
  }

  @Delete(':id/assessments/:assessmentId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async detachAssessment(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('assessmentId') assessmentId: string,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.placementsService.detachAssessment(
      id,
      assessmentId,
      actorId,
      req.user.role,
    );
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.placementsService.findOne(id, actorId, req.user.role);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updatePlacementDto: UpdatePlacementDto,
  ) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.placementsService.update(
      id,
      updatePlacementDto,
      actorId,
      req.user.role,
    );
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  verifyDrive(
    @Param('id') id: string,
    @Body('verificationStatus') verificationStatus: DriveVerificationStatus,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.placementsService.verifyDrive(
      id,
      verificationStatus,
      rejectionReason,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const actorId =
      req.user.role === UserRole.COMPANY_ADMIN
        ? await this.companyScope.resolveCompanyId(req.user.id, req.user.role)
        : req.user.id;
    return this.placementsService.remove(id, actorId, req.user.role);
  }
}
