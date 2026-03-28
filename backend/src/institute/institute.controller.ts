import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { CollegesService } from '../colleges/colleges.service';

@ApiTags('institute')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('institute')
export class InstituteController {
  constructor(private readonly collegesService: CollegesService) {}

  @Get('dashboard')
  @Roles(UserRole.COLLEGE_ADMIN, UserRole.MENTOR, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Institute dashboard stats' })
  async dashboard(@Request() req: AuthenticatedRequest) {
    return this.collegesService.getInstituteDashboard((req.user.collegeId as string));
  }

  @Get('students')
  @Roles(UserRole.COLLEGE_ADMIN, UserRole.MENTOR, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Institute students list with filters' })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async students(
    @Request() req: AuthenticatedRequest,
    @Query('year') year?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const scopeDepartment = req.user?.department || null;
    const scopeYear = req.user?.year || null;
    return this.collegesService.getInstituteStudents((req.user.collegeId as string), {
      year: year ? Number(year) : undefined,
      department,
      status,
      search,
      scopeDepartment,
      scopeYear,
    });
  }

  @Get('placements')
  @Roles(UserRole.COLLEGE_ADMIN, UserRole.MENTOR, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Institute placement metrics' })
  async placements(@Request() req: AuthenticatedRequest) {
    return this.collegesService.getInstitutePlacements((req.user.collegeId as string));
  }

  @Get('skills')
  @Roles(UserRole.COLLEGE_ADMIN, UserRole.MENTOR, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Institute skills heatmap' })
  async skills(@Request() req: AuthenticatedRequest) {
    return this.collegesService.getInstituteSkills((req.user.collegeId as string));
  }

  @Get('reports')
  @Roles(UserRole.COLLEGE_ADMIN, UserRole.MENTOR, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Institute reports leaderboard' })
  async reports(@Request() req: AuthenticatedRequest) {
    return this.collegesService.getInstituteReports((req.user.collegeId as string));
  }
}
