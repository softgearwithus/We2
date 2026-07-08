import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { AssessmentsService } from './assessments.service';
import { CreateHiringAssessmentDto } from '../placements/dto/create-hiring-assessment.dto';
import { GenerateHiringAssessmentDto } from '../placements/dto/generate-hiring-assessment.dto';
import { UpdateHiringAssessmentDto } from '../placements/dto/update-hiring-assessment.dto';
import { FetchAssessmentContextUrlDto } from './dto/fetch-assessment-context-url.dto';
import { CompanyScopeService } from '../company-settings/company-scope.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY_ADMIN)
@Controller('assessments')
export class AssessmentsController {
  constructor(
    private readonly assessmentsService: AssessmentsService,
    private readonly companyScope: CompanyScopeService,
  ) {}

  @Get()
  async list(@Request() req: AuthenticatedRequest) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.assessmentsService.listCompanyAssessments(companyId);
  }

  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateHiringAssessmentDto,
  ) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.assessmentsService.createCompanyAssessment(companyId, dto);
  }

  @Post('generate')
  async generate(
    @Request() req: AuthenticatedRequest,
    @Body() dto: GenerateHiringAssessmentDto,
  ) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.assessmentsService.generateCompanyAssessment(companyId, dto);
  }

  @Get('generation-runs')
  async listGenerationRuns(@Request() req: AuthenticatedRequest) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.assessmentsService.listGenerationRuns(companyId);
  }

  @Get('generation-runs/:id')
  async findGenerationRun(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.assessmentsService.findGenerationRun(companyId, id);
  }

  @Post('context/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadContext(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('A txt, md, or pdf file is required.');
    }
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.assessmentsService.extractUploadedJobDescriptionContext(
      companyId,
      file,
    );
  }

  @Post('context/fetch-url')
  async fetchUrlContext(
    @Request() req: AuthenticatedRequest,
    @Body() dto: FetchAssessmentContextUrlDto,
  ) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.assessmentsService.fetchJobDescriptionContextFromUrl(
      companyId,
      dto.url,
    );
  }

  @Get(':id')
  async find(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.assessmentsService.findCompanyAssessment(companyId, id);
  }

  @Patch(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateHiringAssessmentDto,
  ) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.assessmentsService.updateCompanyAssessment(companyId, id, dto);
  }

  @Delete(':id')
  async delete(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.assessmentsService.deleteCompanyAssessment(companyId, id);
  }
}
