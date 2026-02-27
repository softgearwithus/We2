import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { PlacementsService } from './placements.service';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { UpdatePlacementDto } from './dto/update-placement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlacementType, PlacementStatus, DriveVerificationStatus } from './entities/placement.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('placements')
export class PlacementsController {
  constructor(private readonly placementsService: PlacementsService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  create(@Request() req: any, @Body() createPlacementDto: CreatePlacementDto) {
    if (req.user.role === UserRole.COMPANY_ADMIN) {
      createPlacementDto.companyId = req.user.id;
    }
    return this.placementsService.create(createPlacementDto);
  }

  @Get('my-drives')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  findMyDrives(@Request() req: any) {
    return this.placementsService.findMyDrives(req.user.id);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('type') type?: PlacementType,
    @Query('status') status?: PlacementStatus
  ) {
    const isSuperAdmin = req.user.role === UserRole.SUPER_ADMIN;
    return this.placementsService.findAll(type, status, isSuperAdmin);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placementsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  update(@Param('id') id: string, @Body() updatePlacementDto: UpdatePlacementDto) {
    return this.placementsService.update(id, updatePlacementDto);
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  verifyDrive(
    @Param('id') id: string,
    @Body('verificationStatus') verificationStatus: DriveVerificationStatus,
    @Body('rejectionReason') rejectionReason?: string
  ) {
    return this.placementsService.verifyDrive(id, verificationStatus, rejectionReason);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  remove(@Param('id') id: string) {
    return this.placementsService.remove(id);
  }
}
