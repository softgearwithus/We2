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
import { SqlService } from './sql.service';
import { CreateSqlProblemDto } from './dto/create-sql-problem.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('sql-training')
@Controller('sql-training')
export class SqlTrainingController {
    constructor(private readonly sqlService: SqlService) { }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('task')
    @ApiOperation({ summary: 'Get next SQL training task' })
    async getTrainingTask(@Request() req: any) {
        return this.sqlService.getNextTrainingTask(req.user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('task/:problemId')
    @ApiOperation({ summary: 'Get SQL training task for a selected problem' })
    @ApiParam({ name: 'problemId', description: 'Problem UUID' })
    async getSelectedTrainingTask(@Request() req: any, @Param('problemId') problemId: string) {
        return this.sqlService.getTrainingProblem(req.user.id, problemId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('submit')
    @ApiOperation({ summary: 'Submit SQL training solution (Gemini graded)' })
    async submitTrainingTask(
        @Request() req: any,
        @Body() payload: { sessionId: string; code: string; language: string },
    ) {
        return this.sqlService.submitTrainingSolution(req.user.id, payload);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('learn/:problemId')
    @ApiOperation({ summary: 'Get learning insight for SQL problem' })
    @ApiParam({ name: 'problemId', description: 'Problem UUID' })
    async getTrainingInsight(@Param('problemId') problemId: string) {
        return this.sqlService.getLearningInsight(problemId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('learn/:problemId')
    @ApiOperation({ summary: 'Generate learning insight for SQL problem' })
    @ApiParam({ name: 'problemId', description: 'Problem UUID' })
    async generateTrainingInsightForUser(@Param('problemId') problemId: string) {
        return this.sqlService.generateInsightForProblem(problemId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('submissions')
    @ApiOperation({ summary: 'Get my SQL training submissions' })
    async getTrainingSubmissions(@Request() req: any) {
        return this.sqlService.getUserTrainingSubmissions(req.user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('submissions/:problemId')
    @ApiOperation({ summary: 'Get my SQL training submissions for a problem' })
    @ApiParam({ name: 'problemId', description: 'Problem UUID' })
    async getTrainingSubmissionsForProblem(@Request() req: any, @Param('problemId') problemId: string) {
        return this.sqlService.getUserTrainingSubmissions(req.user.id, problemId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('admin/problems')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create a SQL training problem (Admin only)' })
    async createTrainingProblem(@Body() dto: CreateSqlProblemDto) {
        return this.sqlService.createProblem(dto);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('admin/seed')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Seed SQL problems from sql_dataset.json (Admin only)' })
    async seedTrainingProblems() {
        return this.sqlService.seedProblemsFromDataset();
    }
}
