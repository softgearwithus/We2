import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { CollegesService } from './colleges.service';
import { CreateCollegeDto } from './dto/create-college.dto';

@ApiTags('colleges')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('colleges')
export class CollegesController {
    constructor(private readonly collegesService: CollegesService) {}

    @Get()
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'List colleges (Super Admin only)' })
    @ApiResponse({ status: 200, description: 'Colleges list' })
    async listColleges() {
        return this.collegesService.findAll();
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create college (Super Admin only)' })
    @ApiResponse({ status: 201, description: 'College created' })
    async createCollege(@Body() body: CreateCollegeDto) {
        return this.collegesService.create(body);
    }
}
