import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('projects')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Create a team project (Admin only)' })
    @ApiResponse({ status: 201, description: 'Project created' })
    @ApiResponse({ status: 403, description: 'Admin access required' })
    async create(@Body() dto: CreateProjectDto) {
        return this.projectsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get projects by team' })
    @ApiQuery({ name: 'teamId', required: true })
    @ApiResponse({ status: 200, description: 'List of team projects' })
    async findByTeam(@Query('teamId') teamId: string) {
        return this.projectsService.findByTeam(teamId);
    }

    @Get('admin/all')
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Get all projects (Admin only)' })
    @ApiResponse({ status: 200, description: 'All projects' })
    async findAll() {
        return this.projectsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get project by ID' })
    @ApiParam({ name: 'id', description: 'Project UUID' })
    @ApiResponse({ status: 200, description: 'Project details' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    async findOne(@Param('id') id: string) {
        return this.projectsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update project' })
    @ApiParam({ name: 'id', description: 'Project UUID' })
    @ApiResponse({ status: 200, description: 'Project updated' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
        return this.projectsService.update(id, dto);
    }
}
