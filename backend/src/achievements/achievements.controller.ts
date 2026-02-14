import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('achievements')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('achievements')
export class AchievementsController {
    constructor(private readonly achievementsService: AchievementsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Award an achievement (Admin/AI only)' })
    @ApiResponse({ status: 201, description: 'Achievement awarded' })
    @ApiResponse({ status: 403, description: 'Admin access required' })
    async create(@Body() dto: CreateAchievementDto) {
        return this.achievementsService.create(dto);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get my earned achievements' })
    @ApiResponse({ status: 200, description: 'List of earned achievements' })
    async getMyAchievements(@Request() req: any) {
        return this.achievementsService.findByUser(req.user.id);
    }

    @Get('me/xp')
    @ApiOperation({ summary: 'Get my XP summary' })
    @ApiResponse({
        status: 200,
        description: 'XP summary with breakdown by category',
        schema: {
            example: {
                totalXp: 1250,
                totalAchievements: 8,
                byCategory: {
                    milestone: { totalXp: 500, count: 2 },
                    skill: { totalXp: 750, count: 6 },
                },
                recent: [],
            },
        },
    })
    async getMyXp(@Request() req: any) {
        return this.achievementsService.getXpSummary(req.user.id);
    }

    @Get('leaderboard')
    @ApiOperation({ summary: 'Get XP leaderboard' })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiResponse({ status: 200, description: 'XP leaderboard' })
    async getLeaderboard(@Query('limit') limit?: number) {
        return this.achievementsService.getXpLeaderboard(limit || 10);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific achievement' })
    @ApiParam({ name: 'id', description: 'Achievement UUID' })
    @ApiResponse({ status: 200, description: 'Achievement details' })
    @ApiResponse({ status: 404, description: 'Achievement not found' })
    async findOne(@Param('id') id: string) {
        return this.achievementsService.findOne(id);
    }

    @Get('user/:userId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Get achievements for a user (Admin only)' })
    @ApiParam({ name: 'userId', description: 'User UUID' })
    @ApiResponse({ status: 200, description: 'User achievements' })
    @ApiResponse({ status: 403, description: 'Admin access required' })
    async getUserAchievements(@Param('userId') userId: string) {
        return this.achievementsService.getXpSummary(userId);
    }
}
