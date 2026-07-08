import type { Response } from 'express';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Delete,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public, Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { IntegrationsService } from './integrations.service';
import { LinkGithubRepositoryDto } from './dto/link-github-repository.dto';
import { CompanyScopeService } from '../company-settings/company-scope.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly companyScope: CompanyScopeService,
  ) {}

  @Get('github/install-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  async getGithubInstallUrl(
    @Request() req: AuthenticatedRequest,
    @Query('next') next?: string,
  ) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.integrationsService.getGithubInstallUrl(
      companyId,
      req.user.id,
      next,
    );
  }

  @Public()
  @Get('github/callback')
  async githubCallback(
    @Query('installation_id') installationId: string,
    @Query('setup_action') setupAction: string | undefined,
    @Query('code') code: string | undefined,
    @Query('state') state: string,
    @Res() response: Response,
  ) {
    try {
      const result = await this.integrationsService.completeGithubInstallation({
        installationId,
        setupAction,
        code,
        state,
      });
      response.redirect(result.next);
    } catch (error) {
      response.redirect(
        this.integrationsService.buildGithubFailureRedirect(state, error),
      );
    }
  }

  @Get('github/repositories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  async listGithubRepositories(
    @Request() req: AuthenticatedRequest,
    @Query('sync') sync?: string,
    @Query('linked') linked?: string,
    @Query('available') available?: string,
  ) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.integrationsService.listGithubRepositories(
      companyId,
      {
        sync: sync === 'true',
        linked: linked === 'true',
        available: available === 'true',
      },
    );
  }

  @Get('github/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  async getGithubStatus(@Request() req: AuthenticatedRequest) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.integrationsService.getGithubStatus(companyId);
  }

  @Get('github/repositories/:repositoryId/context')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  async getGithubRepositoryContext(
    @Request() req: AuthenticatedRequest,
    @Param('repositoryId') repositoryId: string,
  ) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.integrationsService.getGithubRepositoryContext(
      companyId,
      repositoryId,
    );
  }

  @Post('github/repositories/:repositoryId/refresh')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  async refreshGithubRepositoryContext(
    @Request() req: AuthenticatedRequest,
    @Param('repositoryId') repositoryId: string,
  ) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.integrationsService.refreshGithubRepositoryContextForCompany(
      companyId,
      repositoryId,
    );
  }

  @Patch('github/repositories/:repositoryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  async updateGithubRepository(
    @Request() req: AuthenticatedRequest,
    @Param('repositoryId') repositoryId: string,
    @Body() dto: { branch?: string },
  ) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.integrationsService.updateGithubRepository(
      companyId,
      repositoryId,
      dto,
    );
  }

  @Delete('github/repositories/:repositoryId/link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  async unlinkGithubRepository(
    @Request() req: AuthenticatedRequest,
    @Param('repositoryId') repositoryId: string,
  ) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.integrationsService.unlinkGithubRepository(
      companyId,
      repositoryId,
    );
  }

  @Delete('github/repositories/:repositoryId/context')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  async deleteGithubRepositoryContext(
    @Request() req: AuthenticatedRequest,
    @Param('repositoryId') repositoryId: string,
  ) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.integrationsService.deleteGithubRepositoryContext(
      companyId,
      repositoryId,
    );
  }

  @Post('github/repositories/link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  async linkGithubRepository(
    @Request() req: AuthenticatedRequest,
    @Body() dto: LinkGithubRepositoryDto,
  ) {
    const companyId = await this.companyScope.resolveCompanyId(
      req.user.id,
      req.user.role,
    );
    return this.integrationsService.linkGithubRepository(companyId, dto);
  }
}
