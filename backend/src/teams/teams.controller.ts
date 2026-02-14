import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
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
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('teams')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teams')
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    // ── Team CRUD ────────────────────────────────────────

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Create a new team (Admin only)' })
    @ApiResponse({ status: 201, description: 'Team created successfully' })
    @ApiResponse({ status: 403, description: 'Admin access required' })
    async create(@Body() createTeamDto: CreateTeamDto) {
        return this.teamsService.create(createTeamDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all active teams' })
    @ApiResponse({ status: 200, description: 'List of teams with members' })
    async findAll() {
        return this.teamsService.findAll();
    }

    @Get('my-teams')
    @ApiOperation({ summary: 'Get teams the current user belongs to' })
    @ApiResponse({ status: 200, description: 'Teams the user is a member of' })
    async getMyTeams(@Request() req: any) {
        return this.teamsService.getUserTeams(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get team details by ID' })
    @ApiParam({ name: 'id', description: 'Team UUID' })
    @ApiResponse({ status: 200, description: 'Team details with members and projects' })
    @ApiResponse({ status: 404, description: 'Team not found' })
    async findOne(@Param('id') id: string) {
        return this.teamsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Update team details (Admin only)' })
    @ApiParam({ name: 'id', description: 'Team UUID' })
    @ApiResponse({ status: 200, description: 'Team updated' })
    @ApiResponse({ status: 404, description: 'Team not found' })
    async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
        return this.teamsService.update(id, updateTeamDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Deactivate a team (Admin only, soft delete)' })
    @ApiParam({ name: 'id', description: 'Team UUID' })
    @ApiResponse({ status: 204, description: 'Team deactivated' })
    @ApiResponse({ status: 404, description: 'Team not found' })
    async remove(@Param('id') id: string) {
        return this.teamsService.remove(id);
    }

    // ── Member Management ────────────────────────────────

    @Get(':id/members')
    @ApiOperation({ summary: 'Get active members of a team' })
    @ApiParam({ name: 'id', description: 'Team UUID' })
    @ApiResponse({ status: 200, description: 'List of active team members' })
    @ApiResponse({ status: 404, description: 'Team not found' })
    async getMembers(@Param('id') id: string) {
        return this.teamsService.getTeamMembers(id);
    }

    @Post(':id/members')
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Add a member to a team (Admin only)' })
    @ApiParam({ name: 'id', description: 'Team UUID' })
    @ApiResponse({ status: 201, description: 'Member added successfully' })
    @ApiResponse({ status: 400, description: 'Team is full' })
    @ApiResponse({ status: 404, description: 'Team not found' })
    @ApiResponse({ status: 409, description: 'User is already a member' })
    async addMember(
        @Param('id') id: string,
        @Body() addMemberDto: AddMemberDto,
    ) {
        return this.teamsService.addMember(id, addMemberDto);
    }

    @Delete(':id/members/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
    @ApiOperation({ summary: 'Remove a member from a team (Admin only)' })
    @ApiParam({ name: 'id', description: 'Team UUID' })
    @ApiParam({ name: 'userId', description: 'User UUID to remove' })
    @ApiResponse({ status: 204, description: 'Member removed' })
    @ApiResponse({ status: 404, description: 'Member not found' })
    async removeMember(
        @Param('id') id: string,
        @Param('userId') userId: string,
    ) {
        return this.teamsService.removeMember(id, userId);
    }
}
