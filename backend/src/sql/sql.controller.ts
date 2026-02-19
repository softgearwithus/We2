import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { SqlService } from './sql.service';
import { CreateSqlProblemDto } from './dto/create-sql-problem.dto';
import { CreateSqlSubmissionDto } from './dto/create-sql-submission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Public } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { SqlDifficulty } from './entities/sql-problem.entity';

@ApiTags('sql')
@Controller('sql')
export class SqlController {
    constructor(private readonly sqlService: SqlService) { }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('problems')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create a new SQL problem (Admin only)' })
    @ApiResponse({ status: 201, description: 'Problem created successfully' })
    @ApiResponse({ status: 403, description: 'Admin access required' })
    async createProblem(@Body() dto: CreateSqlProblemDto) {
        return this.sqlService.createProblem(dto);
    }

    @Get('problems')
    @Public()
    @ApiOperation({ summary: 'Get all SQL problems' })
    @ApiQuery({ name: 'difficulty', enum: SqlDifficulty, required: false })
    @ApiResponse({ status: 200, description: 'List of problems' })
    async getAllProblems(@Query('difficulty') difficulty?: SqlDifficulty) {
        return this.sqlService.getAllProblems(difficulty);
    }

    @Get('problems/slug/:slug')
    @Public()
    @ApiOperation({ summary: 'Get SQL problem by slug' })
    @ApiParam({ name: 'slug', example: 'recyclable-and-low-fat-products' })
    @ApiResponse({ status: 200, description: 'Problem details' })
    @ApiResponse({ status: 404, description: 'Problem not found' })
    async getProblemBySlug(@Param('slug') slug: string) {
        return this.sqlService.getProblemBySlug(slug);
    }

    @Get('problems/:id')
    @Public()
    @ApiOperation({ summary: 'Get SQL problem by ID' })
    @ApiParam({ name: 'id', description: 'Problem UUID' })
    @ApiResponse({ status: 200, description: 'Problem details' })
    @ApiResponse({ status: 404, description: 'Problem not found' })
    async getProblemById(@Param('id') id: string) {
        return this.sqlService.getProblemById(id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('submissions')
    @ApiOperation({ summary: 'Submit a SQL solution (Direct)' })
    @ApiResponse({ status: 201, description: 'Submission stored' })
    async createSubmission(@Request() req: any, @Body() dto: CreateSqlSubmissionDto) {
        return this.sqlService.createSubmission(req.user.id, dto);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('submissions/me')
    @ApiOperation({ summary: 'Get my SQL submissions' })
    @ApiResponse({ status: 200, description: 'List of user submissions' })
    async getMySubmissions(@Request() req: any) {
        return this.sqlService.getUserSubmissions(req.user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('submissions/problem/:problemId')
    @ApiOperation({ summary: 'Get my SQL submissions for a specific problem' })
    @ApiParam({ name: 'problemId', description: 'Problem UUID' })
    @ApiResponse({ status: 200, description: 'List of submissions' })
    async getSubmissionsForProblem(
        @Request() req: any,
        @Param('problemId') problemId: string,
    ) {
        return this.sqlService.getUserSubmissionsForProblem(req.user.id, problemId);
    }
}
