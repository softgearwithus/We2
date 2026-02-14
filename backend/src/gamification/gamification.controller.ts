import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('gamification')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('gamification')
export class GamificationController {
    constructor(private readonly gamificationService: GamificationService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get my gamification profile (XP, Level, Streak)' })
    async getMyProfile(@Request() req: any) {
        return this.gamificationService.getProfile(req.user.id);
    }

    @Get('badges')
    @ApiOperation({ summary: 'Get all badges and my earned ones' })
    async getBadges(@Request() req: any) {
        const [allBadges, myBadges] = await Promise.all([
            this.gamificationService.getAllBadges(),
            this.gamificationService.getBadges(req.user.id),
        ]);

        return {
            available: allBadges,
            earned: myBadges.map(ub => ({
                ...ub.badge,
                earnedAt: ub.earnedAt
            }))
        };
    }
}
