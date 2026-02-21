import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('overview')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Admin dashboard overview' })
    async getOverview() {
        return this.adminService.getOverview();
    }

    @Get('analytics')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Admin analytics summary' })
    async getAnalytics() {
        return this.adminService.getAnalytics();
    }
}
