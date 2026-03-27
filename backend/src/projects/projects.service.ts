import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepo: Repository<Project>,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepo.create({
      ...dto,
      status: ProjectStatus.PLANNING,
    });
    return this.projectsRepo.save(project);
  }

  async findByTeam(teamId: string): Promise<Project[]> {
    return this.projectsRepo.find({
      where: { teamId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepo.findOne({
      where: { id },
      relations: ['team'],
    });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);

    Object.assign(project, dto);

    // Auto-set completion timestamp
    if (dto.status === ProjectStatus.DEPLOYED && !project.completedAt) {
      project.completedAt = new Date();
    }

    return this.projectsRepo.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepo.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
