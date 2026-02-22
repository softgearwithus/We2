import {
    Controller,
    Get,
    Patch,
    Post,
    Body,
    UseGuards,
    Request,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({
        status: 200,
        description: 'User profile retrieved successfully',
        schema: {
            example: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                email: 'student@example.com',
                role: 'student',
                createdAt: '2026-02-11T01:00:00.000Z',
                updatedAt: '2026-02-11T01:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getProfile(@Request() req: any) {
        return this.usersService.findById(req.user.id);
    }

    @Get('dashboard-stats')
    @ApiOperation({ summary: 'Get user dashboard statistics' })
    @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
    async getDashboardStats(@Request() req: any) {
        return this.usersService.getDashboardStats(req.user.id);
    }

    @Patch('profile')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updateProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(req.user.id, updateUserDto);
    }

    @Post('upgrade')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Upgrade user subscription plan' })
    @ApiBody({ schema: { type: 'object', properties: { plan: { type: 'string', example: 'placement_plus' } } } })
    @ApiResponse({ status: 200, description: 'Subscription upgraded successfully' })
    @ApiResponse({ status: 403, description: 'Upgrades are temporarily disabled' })
    async upgradeSubscription(@Request() req: any, @Body('plan') plan: string) {
        return this.usersService.upgradeSubscription(req.user.id, plan);
    }

    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Get user by ID (Admin only)' })
    @ApiResponse({ status: 200, description: 'User retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUserById(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Get all users (Admin only)' })
    @ApiResponse({ status: 200, description: 'Users list retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async getAllUsers() {
        return this.usersService.findAll();
    }
}
