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

@UseGuards(JwtAuthGuard)
@Controller('placements')
export class PlacementsController {
  constructor(private readonly placementsService: PlacementsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createPlacementDto: CreatePlacementDto,
  ) {
    if (req.user.role === UserRole.COMPANY_ADMIN) {
      createPlacementDto.companyId = req.user.id;
      if (!createPlacementDto.companyName) {
        createPlacementDto.companyName = req.user.email;
      }
    }
    return this.placementsService.create(createPlacementDto);
  }

  @Get('my-drives')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  findMyDrives(@Request() req: AuthenticatedRequest) {
    return this.placementsService.findMyDrives(req.user.id);
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

  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.placementsService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updatePlacementDto: UpdatePlacementDto,
  ) {
    return this.placementsService.update(
      id,
      updatePlacementDto,
      req.user.id,
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
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.placementsService.remove(id, req.user.id, req.user.role);
  }
}
