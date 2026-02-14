import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('interviews')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('interviews')
export class InterviewsController {
    constructor(private readonly interviewsService: InterviewsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new mock interview session' })
    @ApiResponse({ status: 201, description: 'Interview session created' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async create(@Body() dto: CreateInterviewDto) {
        return this.interviewsService.create(dto);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get my interview sessions' })
    @ApiResponse({ status: 200, description: 'List of interview sessions' })
    async getMyInterviews(@Request() req: any) {
        return this.interviewsService.findByUser(req.user.id);
    }

    @Get('me/stats')
    @ApiOperation({ summary: 'Get my interview statistics' })
    @ApiResponse({
        status: 200,
        description: 'Interview statistics',
        schema: {
            example: {
                total: 8,
                completed: 5,
                inProgress: 1,
                averageScore: 82.4,
                byType: {
                    technical: { count: 3, avgScore: 85 },
                    behavioral: { count: 2, avgScore: 78 },
                },
            },
        },
    })
    async getMyStats(@Request() req: any) {
        return this.interviewsService.getStats(req.user.id);
    }

    @Get('admin/all')
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Get all interviews (Admin only)' })
    @ApiResponse({ status: 200, description: 'All interview sessions' })
    @ApiResponse({ status: 403, description: 'Admin access required' })
    async findAll() {
        return this.interviewsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get interview session details' })
    @ApiParam({ name: 'id', description: 'Interview UUID' })
    @ApiResponse({ status: 200, description: 'Interview details' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Interview not found' })
    async findOne(@Param('id') id: string, @Request() req: any) {
        return this.interviewsService.findOne(id, req.user.id);
    }

    @Post(':id/start')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Start an interview session' })
    @ApiParam({ name: 'id', description: 'Interview UUID' })
    @ApiResponse({ status: 200, description: 'Interview started' })
    @ApiResponse({ status: 400, description: 'Interview already started' })
    @ApiResponse({ status: 404, description: 'Interview not found' })
    async start(@Param('id') id: string, @Request() req: any) {
        return this.interviewsService.start(id, req.user.id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update interview session (AI-driven)' })
    @ApiParam({ name: 'id', description: 'Interview UUID' })
    @ApiResponse({ status: 200, description: 'Interview updated' })
    @ApiResponse({ status: 400, description: 'Cannot update completed interview' })
    @ApiResponse({ status: 404, description: 'Interview not found' })
    async update(
        @Param('id') id: string,
        @Request() req: any,
        @Body() dto: UpdateInterviewDto,
    ) {
        return this.interviewsService.update(id, req.user.id, dto);
    }
}
