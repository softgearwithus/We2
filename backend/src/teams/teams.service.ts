import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Team } from './entities/team.entity';
import { TeamMember, TeamMemberRole } from './entities/team-member.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team)
        private teamsRepository: Repository<Team>,
        @InjectRepository(TeamMember)
        private teamMembersRepository: Repository<TeamMember>,
    ) { }

    // ── Team CRUD ────────────────────────────────────────

    async create(createTeamDto: CreateTeamDto): Promise<Team> {
        const team = this.teamsRepository.create(createTeamDto);
        return this.teamsRepository.save(team);
    }

    async findAll(): Promise<Team[]> {
        return this.teamsRepository.find({
            relations: ['members', 'members.user'],
            where: { isActive: true },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Team> {
        const team = await this.teamsRepository.findOne({
            where: { id },
            relations: ['members', 'members.user', 'projects'],
        });
        if (!team) {
            throw new NotFoundException(`Team ${id} not found`);
        }
        return team;
    }

    async update(id: string, dto: UpdateTeamDto): Promise<Team> {
        const team = await this.findOne(id);
        Object.assign(team, dto);
        return this.teamsRepository.save(team);
    }

    async remove(id: string): Promise<void> {
        const team = await this.findOne(id);
        team.isActive = false;
        await this.teamsRepository.save(team);
    }

    // ── Member Management ────────────────────────────────

    async addMember(teamId: string, dto: AddMemberDto): Promise<TeamMember> {
        const team = await this.findOne(teamId);

        // Check capacity
        const activeMembers = await this.teamMembersRepository.count({
            where: { teamId, leftAt: IsNull() },
        });

        if (activeMembers >= team.maxMembers) {
            throw new BadRequestException(
                `Team is full (max ${team.maxMembers} members)`,
            );
        }

        // Check if user is already on this team
        const existing = await this.teamMembersRepository.findOne({
            where: { teamId, userId: dto.userId, leftAt: IsNull() },
        });

        if (existing) {
            throw new ConflictException('User is already a member of this team');
        }

        const member = this.teamMembersRepository.create({
            teamId,
            userId: dto.userId,
            role: dto.role || TeamMemberRole.DEVELOPER,
        });

        return this.teamMembersRepository.save(member);
    }

    async removeMember(teamId: string, userId: string): Promise<void> {
        const member = await this.teamMembersRepository.findOne({
            where: { teamId, userId, leftAt: IsNull() },
        });

        if (!member) {
            throw new NotFoundException('Member not found in this team');
        }

        member.leftAt = new Date();
        await this.teamMembersRepository.save(member);
    }

    async getTeamMembers(teamId: string): Promise<TeamMember[]> {
        await this.findOne(teamId); // Verify team exists
        return this.teamMembersRepository.find({
            where: { teamId, leftAt: IsNull() },
            relations: ['user'],
        });
    }

    async getUserTeams(userId: string): Promise<TeamMember[]> {
        return this.teamMembersRepository.find({
            where: { userId, leftAt: IsNull() },
            relations: ['team'],
        });
    }

    async changeMemberRole(
        teamId: string,
        userId: string,
        newRole: TeamMemberRole,
    ): Promise<TeamMember> {
        const member = await this.teamMembersRepository.findOne({
            where: { teamId, userId, leftAt: IsNull() },
        });

        if (!member) {
            throw new NotFoundException('Member not found in this team');
        }

        member.role = newRole;
        return this.teamMembersRepository.save(member);
    }
}
