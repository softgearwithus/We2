import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CollegesService } from './colleges.service';
import { CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('colleges')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('colleges')
export class CollegesController {
  constructor(private readonly collegesService: CollegesService) {}

  private enforceCollegeAccess(req: any, collegeId: string) {
    if (req.user?.role === UserRole.SUPER_ADMIN) {
      return;
    }
    if (!req.user?.collegeId || req.user.collegeId !== collegeId) {
      throw new ForbiddenException('Access denied for this college');
    }
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List colleges (super admin only)' })
  async listColleges() {
    return this.collegesService.findAll();
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a college (super admin only)' })
  async createCollege(@Body() payload: CreateCollegeDto) {
    return this.collegesService.create(payload);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'College UUID' })
  @ApiOperation({ summary: 'Get college by ID' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN)
  async getCollege(@Request() req: any, @Param('id') id: string) {
    this.enforceCollegeAccess(req, id);
    return this.collegesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiParam({ name: 'id', description: 'College UUID' })
  @ApiOperation({ summary: 'Update college' })
  async updateCollege(
    @Param('id') id: string,
    @Body() payload: UpdateCollegeDto,
  ) {
    return this.collegesService.update(id, payload);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiParam({ name: 'id', description: 'College UUID' })
  @ApiOperation({ summary: 'Delete college' })
  async deleteCollege(@Param('id') id: string) {
    return this.collegesService.remove(id);
  }

  @Get(':id/staff')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN)
  @ApiParam({ name: 'id', description: 'College UUID' })
  @ApiOperation({ summary: 'List staff by college' })
  async listStaff(@Request() req: any, @Param('id') id: string) {
    this.enforceCollegeAccess(req, id);
    return this.collegesService.listStaff(id);
  }

  @Post(':id/staff')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN)
  @ApiParam({ name: 'id', description: 'College UUID' })
  @ApiOperation({ summary: 'Add staff to college' })
  async addStaff(
    @Request() req: any,
    @Param('id') id: string,
    @Body() payload: CreateStaffDto,
  ) {
    this.enforceCollegeAccess(req, id);
    return this.collegesService.addStaff(id, payload);
  }

  @Delete(':id/staff/:staffId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN)
  @ApiParam({ name: 'id', description: 'College UUID' })
  @ApiParam({ name: 'staffId', description: 'Staff UUID' })
  @ApiOperation({ summary: 'Deactivate staff member' })
  async removeStaff(
    @Request() req: any,
    @Param('id') id: string,
    @Param('staffId') staffId: string,
  ) {
    this.enforceCollegeAccess(req, id);
    return this.collegesService.removeStaff(id, staffId);
  }

  @Get(':id/cohorts')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN)
  @ApiParam({ name: 'id', description: 'College UUID' })
  @ApiOperation({ summary: 'List student cohorts' })
  async listCohorts(@Request() req: any, @Param('id') id: string) {
    this.enforceCollegeAccess(req, id);
    return this.collegesService.listCohorts(id);
  }

  @Post(':id/cohorts')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN)
  @ApiParam({ name: 'id', description: 'College UUID' })
  @ApiOperation({ summary: 'Create student cohort + credentials' })
  async createCohort(
    @Request() req: any,
    @Param('id') id: string,
    @Body() payload: CreateCohortDto,
  ) {
    this.enforceCollegeAccess(req, id);
    return this.collegesService.createCohort(id, payload);
  }

  @Get(':id/cohorts/:cohortId/export')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN)
  @ApiParam({ name: 'id', description: 'College UUID' })
  @ApiParam({ name: 'cohortId', description: 'Cohort UUID' })
  @ApiOperation({ summary: 'Export cohort credentials as CSV' })
  async exportCohort(
    @Request() req: any,
    @Param('id') id: string,
    @Param('cohortId') cohortId: string,
    @Res() res: Response,
  ) {
    this.enforceCollegeAccess(req, id);
    const cohort = await this.collegesService.getCohortExport(id, cohortId);
    const headers = ['UID', 'Password', 'Year', 'Department'];
    const rows = cohort.credentials.map((c) => [
      c.uid,
      c.password,
      cohort.year,
      cohort.department,
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${cohort.code}_students.csv"`,
    );
    res.send(csvContent);
  }

  @Delete(':id/cohorts/:cohortId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN)
  @ApiParam({ name: 'id', description: 'College UUID' })
  @ApiParam({ name: 'cohortId', description: 'Cohort UUID' })
  @ApiOperation({ summary: 'Delete student cohort' })
  async deleteCohort(
    @Request() req: any,
    @Param('id') id: string,
    @Param('cohortId') cohortId: string,
  ) {
    this.enforceCollegeAccess(req, id);
    return this.collegesService.deleteCohort(id, cohortId);
  }
}
