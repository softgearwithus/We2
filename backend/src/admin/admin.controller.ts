import {
  Controller,
  Get,
  Post,
  UseGuards,
  Query,
  Patch,
  Delete,
  Param,
  Body,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { AdminService } from './admin.service';
import { CreateCompanyAdminDto } from './dto/create-company-admin.dto';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin analytics summary' })
  async getAnalytics(@Query('range') range?: string) {
    return this.adminService.getAnalytics(range);
  }

  @Get('students')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin students listing' })
  async getStudents() {
    return this.adminService.getStudents();
  }

  @Get('subscriptions/payments')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin recent subscription payment records' })
  async getRecentSubscriptionPayments(@Query('limit') limit?: string) {
    return this.adminService.getRecentSubscriptionPayments(
      limit ? Number(limit) : 50,
    );
  }

  @Patch('students/:id/disable')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Disable a student account' })
  async disableStudent(@Param('id') id: string) {
    return this.adminService.disableStudent(id);
  }

  @Delete('students/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a student account' })
  async deleteStudent(@Param('id') id: string) {
    return this.adminService.deleteStudent(id);
  }

  @Post('companies/admins')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Provision company admin account (super admin only)',
  })
  async createCompanyAdmin(
    @Request()
    req: {
      user?: {
        id?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
      };
    },
    @Body() body: CreateCompanyAdminDto,
  ) {
    return this.adminService.createCompanyAdmin(body, req.user);
  }
}
