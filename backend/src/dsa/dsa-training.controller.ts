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
} from '@nestjs/swagger';
import { DsaService } from './dsa.service';
import { RequireSectionUsage } from '../usage/guards/usage.guard';
import { USAGE_SECTION_KEYS } from '../usage/usage.constants';
import { CreateDsaProblemDto } from './dto/create-dsa-problem.dto';
import { AdminDsaProblemQueryDto } from './dto/admin-dsa-problem-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';

@ApiTags('dsa-training')
@Controller('dsa-training')
export class DsaTrainingController {
    constructor(private readonly dsaService: DsaService) { }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('task')
    @ApiOperation({ summary: 'Get next SRS training task' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.DSA)
    async getTrainingTask(@Request() req: any) {
        return this.dsaService.getNextTrainingTask(req.user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('task/:problemId')
    @ApiOperation({ summary: 'Get training task for a selected problem' })
    @ApiParam({ name: 'problemId', description: 'Problem UUID' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.DSA)
    async getSelectedTrainingTask(@Request() req: any, @Param('problemId') problemId: string) {
        return this.dsaService.getTrainingProblem(req.user.id, problemId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('submit')
    @ApiOperation({ summary: 'Submit training solution (Gemini graded)' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.DSA)
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
    @RequireSectionUsage(USAGE_SECTION_KEYS.DSA)
    async getTrainingInsight(@Param('problemId') problemId: string) {
        return this.dsaService.getLearningInsight(problemId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('learn/:problemId')
    @ApiOperation({ summary: 'Generate learning insight for problem' })
    @ApiParam({ name: 'problemId', description: 'Problem UUID' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.DSA)
    async generateTrainingInsightForUser(@Param('problemId') problemId: string) {
        return this.dsaService.generateInsightForProblem(problemId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('submissions')
    @ApiOperation({ summary: 'Get my training submissions' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.DSA)
    async getTrainingSubmissions(@Request() req: any) {
        return this.dsaService.getUserTrainingSubmissions(req.user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('submissions/:problemId')
    @ApiOperation({ summary: 'Get my training submissions for a problem' })
    @ApiParam({ name: 'problemId', description: 'Problem UUID' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.DSA)
    async getTrainingSubmissionsForProblem(@Request() req: any, @Param('problemId') problemId: string) {
        return this.dsaService.getUserTrainingSubmissions(req.user.id, problemId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('admin/problems')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'List training problems (Admin only)' })
    async listTrainingProblems(@Query() query: AdminDsaProblemQueryDto) {
        return this.dsaService.adminListProblems(query);
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
    @Post('admin/import')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Import DSA problems from JSON (Admin only)' })
    @UseInterceptors(FileInterceptor('file'))
    async importTrainingProblems(@UploadedFile() file?: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Missing JSON file.');
        }
        const raw = file.buffer?.toString('utf-8') || '';
        return this.dsaService.importProblemsFromJson(raw);
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
