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
    UploadedFile,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
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
    @Post('audio/generate')
    async generateAudioDrill(@Body() body: { topic: string }, @Request() req: any) {
        return this.interviewsService.generateAudioDrill(req.user.id, body.topic);
    }

    @Post('communication/generate')
    @ApiOperation({ summary: 'Generate 4-part communication drill' })
    async generateCommunicationDrill(@Body() body: { topic?: string }, @Request() req: any) {
        return this.interviewsService.generateCommunicationDrill(req.user.id, body.topic);
    }

    @Post('audio/analyze')
    @ApiOperation({ summary: 'Analyze audio drill submission' })
    async analyzeAudioDrill(@Body() body: { audio: string; context: string }, @Request() req: any) {
        return this.interviewsService.analyzeAudioDrill(req.user.id, body.audio, body.context);
    }
    @Post('communication/submit')
    @UseInterceptors(AnyFilesInterceptor())
    @ApiOperation({ summary: 'Submit communication drill audio' })
    async submitCommunicationDrill(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() body: { metadata: string },
        @Request() req: any
    ) {
        try {
            const metadata = JSON.parse(body.metadata);
            // 1. Create session immediately (Fast)
            const session = await this.interviewsService.submitCommunicationSession(req.user.id);

            // 2. Trigger background analysis (Async, don't await)
            this.interviewsService.performBackgroundAnalysis(session.id, files, metadata);

            // 3. Return the session immediately so UI can show "Processing..."
            return session;
        } catch (error) {
            throw error;
        }
    }
}
