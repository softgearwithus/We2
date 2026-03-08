import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    BadRequestException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { SqlService } from './sql.service';
import { RequireSectionUsage } from '../usage/guards/usage.guard';
import { USAGE_SECTION_KEYS } from '../usage/usage.constants';
import { CreateSqlProblemDto } from './dto/create-sql-problem.dto';
import { AdminSqlProblemQueryDto } from './dto/admin-sql-problem-query.dto';
import { SqlPlatform } from './entities/sql-problem.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';

@ApiTags('sql-training')
@Controller('sql-training')
export class SqlTrainingController {
    constructor(private readonly sqlService: SqlService) { }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('task')
    @ApiOperation({ summary: 'Get next SQL training task' })
    @ApiQuery({ name: 'platform', required: false, enum: SqlPlatform })
    @RequireSectionUsage(USAGE_SECTION_KEYS.SQL)
    async getTrainingTask(@Request() req: any, @Query('platform') platform?: SqlPlatform) {
        return this.sqlService.getNextTrainingTask(req.user.id, platform);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('task/:problemId')
    @ApiOperation({ summary: 'Get SQL training task for a selected problem' })
    @ApiParam({ name: 'problemId', description: 'Problem UUID' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.SQL)
    async getSelectedTrainingTask(@Request() req: any, @Param('problemId') problemId: string) {
        return this.sqlService.getTrainingProblem(req.user.id, problemId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('submit')
    @ApiOperation({ summary: 'Submit SQL training solution (Gemini graded)' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.SQL)
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
    @RequireSectionUsage(USAGE_SECTION_KEYS.SQL)
    async getTrainingInsight(@Param('problemId') problemId: string) {
        return this.sqlService.getLearningInsight(problemId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('learn/:problemId')
    @ApiOperation({ summary: 'Generate learning insight for SQL problem' })
    @ApiParam({ name: 'problemId', description: 'Problem UUID' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.SQL)
    async generateTrainingInsightForUser(@Param('problemId') problemId: string) {
        return this.sqlService.generateInsightForProblem(problemId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('submissions')
    @ApiOperation({ summary: 'Get my SQL training submissions' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.SQL)
    async getTrainingSubmissions(@Request() req: any) {
        return this.sqlService.getUserTrainingSubmissions(req.user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('submissions/:problemId')
    @ApiOperation({ summary: 'Get my SQL training submissions for a problem' })
    @ApiParam({ name: 'problemId', description: 'Problem UUID' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.SQL)
    async getTrainingSubmissionsForProblem(@Request() req: any, @Param('problemId') problemId: string) {
        return this.sqlService.getUserTrainingSubmissions(req.user.id, problemId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('admin/problems')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'List SQL training problems (Admin only)' })
    async listTrainingProblems(@Query() query: AdminSqlProblemQueryDto) {
        return this.sqlService.adminListProblems(query);
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

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('admin/import')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Import SQL problems from JSON (Admin only)' })
    @UseInterceptors(FileInterceptor('file'))
    async importTrainingProblems(@UploadedFile() file?: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Missing JSON file.');
        }
        const raw = file.buffer?.toString('utf-8') || '';
        return this.sqlService.importProblemsFromJson(raw);
    }
}
