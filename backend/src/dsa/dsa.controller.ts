import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    ServiceUnavailableException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { DsaService } from './dsa.service';
import { CreateDsaProblemDto } from './dto/create-dsa-problem.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Public } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { Difficulty } from './entities/dsa-problem.entity';

@ApiTags('dsa')
@Controller('dsa')
export class DsaController {
    constructor(
        private readonly dsaService: DsaService,
    ) { }

    // ── Problem Endpoints ────────────────────────────────

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('problems')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create a new DSA problem (Admin only)' })
    @ApiResponse({ status: 201, description: 'Problem created successfully' })
    @ApiResponse({ status: 403, description: 'Admin access required' })
    async createProblem(@Body() dto: CreateDsaProblemDto) {
        return this.dsaService.createProblem(dto);
    }

    @Get('problems')
    @Public()
    @ApiOperation({ summary: 'Get all DSA problems' })
    @ApiQuery({ name: 'difficulty', enum: Difficulty, required: false })
    @ApiResponse({ status: 200, description: 'List of problems' })
    async getAllProblems(@Query('difficulty') difficulty?: Difficulty) {
        return this.dsaService.getAllProblems(difficulty);
    }

    @Get('problems/slug/:slug')
    @Public()
    @ApiOperation({ summary: 'Get problem by slug' })
    @ApiParam({ name: 'slug', example: 'two-sum' })
    @ApiResponse({ status: 200, description: 'Problem details' })
    @ApiResponse({ status: 404, description: 'Problem not found' })
    async getProblemBySlug(@Param('slug') slug: string) {
        return this.dsaService.getProblemBySlug(slug);
    }

    @Get('problems/:id')
    @Public()
    @ApiOperation({ summary: 'Get problem by ID' })
    @ApiParam({ name: 'id', description: 'Problem UUID' })
    @ApiResponse({ status: 200, description: 'Problem details' })
    @ApiResponse({ status: 404, description: 'Problem not found' })
    async getProblemById(@Param('id') id: string) {
        return this.dsaService.getProblemById(id);
    }

    // ── Submission Endpoints ──────────────────────────────
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('submissions')
    @ApiOperation({ summary: 'Submit a solution' })
    @ApiResponse({ status: 201, description: 'Submission created' })
    async createSubmission(
        @Request() req: any,
        @Body() dto: CreateSubmissionDto,
    ) {
        if (process.env.CODE_EXECUTION_ENABLED !== 'true') {
            throw new ServiceUnavailableException('Code execution is disabled.');
        }
        const submission = await this.dsaService.createSubmission(req.user.id, dto);
        return { submissionId: submission.id, status: submission.status };
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('submissions/:id')
    @ApiOperation({ summary: 'Get submission details & status' })
    @ApiParam({ name: 'id', description: 'Submission UUID' })
    @ApiResponse({ status: 200, description: 'Submission details' })
    async getSubmission(@Param('id') id: string) {
        return this.dsaService.getSubmission(id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('submissions/me')
    @ApiOperation({ summary: 'Get my submissions' })
    @ApiResponse({ status: 200, description: 'List of user submissions' })
    async getMySubmissions(@Request() req: any) {
        return this.dsaService.getUserSubmissions(req.user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('submissions/problem/:problemId')
    @ApiOperation({ summary: 'Get my submissions for a specific problem' })
    @ApiParam({ name: 'problemId', description: 'Problem UUID' })
    @ApiResponse({ status: 200, description: 'List of submissions' })
    async getSubmissionsForProblem(
        @Request() req: any,
        @Param('problemId') problemId: string,
    ) {
        return this.dsaService.getUserSubmissionsForProblem(
            req.user.id,
            problemId,
        );
    }

    // ── Statistics Endpoints ──────────────────────────────

    @Get('stats/me')
    @ApiOperation({ summary: 'Get my DSA statistics' })
    @ApiResponse({
        status: 200,
        description: 'User DSA stats',
        schema: {
            example: {
                totalSubmissions: 42,
                problemsSolved: 15,
                byDifficulty: { easy: 10, medium: 4, hard: 1 },
            },
        },
    })
    async getMyStats(@Request() req: any) {
        return this.dsaService.getUserStats(req.user.id);
    }


}
