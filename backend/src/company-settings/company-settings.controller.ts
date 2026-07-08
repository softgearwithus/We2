import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public, Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { CompanySettingsService } from './company-settings.service';
import {
  AcceptCompanyInviteDto,
  CreateCompanyApiKeyDto,
  CreateCompanyBillingOrderDto,
  DeactivateCompanyAccountDto,
  InviteCompanyMemberDto,
  UpdateCompanyMemberDto,
  UpdateCompanyProfileDto,
  VerifyCompanyBillingDto,
} from './dto/company-settings.dto';

@ApiTags('company-settings')
@Controller('company-settings')
export class CompanySettingsController {
  constructor(private readonly settingsService: CompanySettingsService) {}

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.settingsService.getProfile(req.user);
  }

  @Patch('profile')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateCompanyProfileDto,
  ) {
    return this.settingsService.updateProfile(req.user, dto);
  }

  @Get('team')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  getTeam(@Request() req: AuthenticatedRequest) {
    return this.settingsService.getTeam(req.user);
  }

  @Post('team/invites')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  inviteMember(
    @Request() req: AuthenticatedRequest,
    @Body() dto: InviteCompanyMemberDto,
  ) {
    return this.settingsService.inviteMember(req.user, dto);
  }

  @Post('team/invites/accept')
  @Public()
  @ApiOperation({ summary: 'Accept a company workspace invite' })
  acceptInvite(@Body() dto: AcceptCompanyInviteDto) {
    return this.settingsService.acceptInvite(dto);
  }

  @Get('team/invites/preview')
  @Public()
  @ApiOperation({ summary: 'Preview a company workspace invite' })
  previewInvite(@Query('token') token?: string) {
    return this.settingsService.previewInvite(token || '');
  }

  @Post('team/invites/:id/resend')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  resendInvite(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.settingsService.resendInvite(req.user, id);
  }

  @Delete('team/invites/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  revokeInvite(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.settingsService.revokeInvite(req.user, id);
  }

  @Patch('team/members/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  updateMember(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCompanyMemberDto,
  ) {
    return this.settingsService.updateMember(req.user, id, dto);
  }

  @Delete('team/members/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  removeMember(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.settingsService.removeMember(req.user, id);
  }

  @Get('billing')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  getBilling(@Request() req: AuthenticatedRequest) {
    return this.settingsService.getBilling(req.user);
  }

  @Post('billing/order')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  createBillingOrder(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateCompanyBillingOrderDto,
  ) {
    return this.settingsService.createBillingOrder(req.user, dto);
  }

  @Post('billing/verify')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  verifyBilling(
    @Request() req: AuthenticatedRequest,
    @Body() dto: VerifyCompanyBillingDto,
  ) {
    return this.settingsService.verifyBilling(req.user, dto);
  }

  @Get('api-keys')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  listApiKeys(@Request() req: AuthenticatedRequest) {
    return this.settingsService.listApiKeys(req.user);
  }

  @Post('api-keys')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  createApiKey(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateCompanyApiKeyDto,
  ) {
    return this.settingsService.createApiKey(req.user, dto);
  }

  @Delete('api-keys/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  revokeApiKey(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.settingsService.revokeApiKey(req.user, id);
  }

  @Get('audit-log')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  listAuditLog(@Request() req: AuthenticatedRequest) {
    return this.settingsService.listAuditLog(req.user);
  }

  @Post('account/deactivate')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  deactivateAccount(
    @Request() req: AuthenticatedRequest,
    @Body() dto: DeactivateCompanyAccountDto,
  ) {
    return this.settingsService.deactivateAccount(req.user, dto);
  }
}
