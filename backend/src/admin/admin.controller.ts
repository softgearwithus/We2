import { Controller, Get, UseGuards, Query, Patch, Delete, Param } from '@nestjs/common';
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
}
