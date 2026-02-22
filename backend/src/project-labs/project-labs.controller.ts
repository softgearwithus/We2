import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ProjectLabsService } from './project-labs.service';
import { CreateProjectLabDto } from './dto/create-project-lab.dto';
import { UpdateProjectLabDto } from './dto/update-project-lab.dto';
import { CreateProjectLabSubmissionDto } from './dto/create-project-lab-submission.dto';
import { UpdateProjectLabSubmissionDto } from './dto/update-project-lab-submission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Public } from '../auth/decorators/auth.decorators';
import { RequireSectionUsage } from '../usage/guards/usage.guard';
import { USAGE_SECTION_KEYS } from '../usage/usage.constants';
import { UserRole } from '../users/user.entity';

@ApiTags('project-labs')
@Controller('project-labs')
export class ProjectLabsController {
    constructor(private readonly projectLabsService: ProjectLabsService) { }

    @Get('domains')
    @Public()
    @ApiOperation({ summary: 'Get available project lab domains' })
    async findDomains() {
        return this.projectLabsService.findDomains();
    }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Get project labs by domain' })
    @ApiQuery({ name: 'domainId', required: false })
    async findAll(@Query('domainId') domainId?: string) {
        return this.projectLabsService.findAll(domainId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('me/progress')
    @ApiOperation({ summary: 'Get my project lab progress' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.PROJECT_LABS)
    async getMyProgress(@Request() req: any) {
        return this.projectLabsService.getMyProgress(req.user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('me/submissions')
    @ApiOperation({ summary: 'Get my project lab submissions' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.PROJECT_LABS)
    async getMySubmissions(@Request() req: any) {
        return this.projectLabsService.getMySubmissions(req.user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post(':id/submissions')
    @ApiOperation({ summary: 'Submit a project lab' })
    @RequireSectionUsage(USAGE_SECTION_KEYS.PROJECT_LABS)
    async submit(@Request() req: any, @Param('id') id: string, @Body() dto: CreateProjectLabSubmissionDto) {
        return this.projectLabsService.submit(req.user.id, id, dto);
    }

    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Get project lab by ID' })
    @ApiParam({ name: 'id', description: 'Project lab UUID' })
    async findOne(@Param('id') id: string) {
        return this.projectLabsService.findOne(id);
    }

    // Admin
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('admin/all')
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Get all project labs (Admin only)' })
    async findAllAdmin() {
        return this.projectLabsService.findAdminAll();
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Create a project lab (Admin only)' })
    @ApiResponse({ status: 201, description: 'Project lab created' })
    async create(@Body() dto: CreateProjectLabDto) {
        return this.projectLabsService.create(dto);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Update a project lab (Admin only)' })
    async update(@Param('id') id: string, @Body() dto: UpdateProjectLabDto) {
        return this.projectLabsService.update(id, dto);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch('admin/submissions/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Update a project lab submission (Admin only)' })
    async updateSubmission(@Param('id') id: string, @Body() dto: UpdateProjectLabSubmissionDto) {
        return this.projectLabsService.updateSubmission(id, dto);
    }
}
