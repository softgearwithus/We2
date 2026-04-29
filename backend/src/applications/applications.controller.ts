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
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(UserRole.STUDENT)
  apply(
    @Request() req: AuthenticatedRequest,
    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    return this.applicationsService.apply(req.user.id, createApplicationDto);
  }

  @Get('drive/:driveId')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN)
  findByPlacement(
    @Request() req: AuthenticatedRequest,
    @Param('driveId') driveId: string,
  ) {
    return this.applicationsService.findByPlacement(
      driveId,
      req.user.id,
      req.user.role,
    );
  }

  @Patch(':id/status')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN)
  updateStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.applicationsService.updateStatus(
      id,
      status,
      req.user.id,
      req.user.role,
    );
  }
}
