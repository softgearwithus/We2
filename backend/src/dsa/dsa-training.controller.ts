import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { DsaService } from './dsa.service';
import { CreateDsaProblemDto } from './dto/create-dsa-problem.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('dsa-training')
@Controller('dsa-training')
export class DsaTrainingController {
    constructor(private readonly dsaService: DsaService) { }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('task')
    @ApiOperation({ summary: 'Get next SRS training task' })
    async getTrainingTask(@Request() req: any) {
        return this.dsaService.getNextTrainingTask(req.user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('submit')
    @ApiOperation({ summary: 'Submit training solution (Gemini graded)' })
    async submitTrainingTask(
        @Request() req: any,
        @Body() payload: { sessionId: string; code: string; language: string },
    ) {
        return this.dsaService.submitTrainingSolution(req.user.id, payload);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('learn/:problemId')
    @ApiOperation({ summary: 'Get learning insight for problem' })
    @ApiParam({ name: 'problemId', description: 'Problem UUID' })
    async getTrainingInsight(@Param('problemId') problemId: string) {
        return this.dsaService.getLearningInsight(problemId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('admin/problems')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create a training problem (Admin only)' })
    async createTrainingProblem(@Body() dto: CreateDsaProblemDto) {
        return this.dsaService.createProblem(dto);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('admin/seed')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Seed DSA problems from dataset.json (Admin only)' })
    async seedTrainingProblems() {
        return this.dsaService.seedProblemsFromDataset();
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('admin/insight/:problemId')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Generate insight for a problem (Admin only)' })
    @ApiParam({ name: 'problemId', description: 'Problem UUID' })
    async generateTrainingInsight(@Param('problemId') problemId: string) {
        return this.dsaService.generateInsightForProblem(problemId);
    }
}
