import { Body, Controller, Get, Patch, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireSectionUsage } from '../usage/guards/usage.guard';
import { USAGE_SECTION_KEYS } from '../usage/usage.constants';
import { PreparationService } from './preparation.service';
import { UpdatePreparationProgressDto } from './dto/update-preparation-progress.dto';

@ApiTags('preparation')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('preparation')
export class PreparationController {
    constructor(private readonly preparationService: PreparationService) { }

    @Get('me/progress')
    @ApiOperation({ summary: 'Get my placement preparation progress' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.PREPARATION)
    async getMyProgress(@Request() req: any) {
        return this.preparationService.getProgress(req.user.id);
    }

    @Patch('me/progress')
    @ApiOperation({ summary: 'Update my placement preparation progress' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.PREPARATION)
    async updateMyProgress(@Request() req: any, @Body() dto: UpdatePreparationProgressDto) {
        return this.preparationService.updateProgress(req.user.id, dto.completedPhaseIds || []);
    }
}
