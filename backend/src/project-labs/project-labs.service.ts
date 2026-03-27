import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectLab } from './entities/project-lab.entity';
import {
  ProjectLabSubmission,
  ProjectLabSubmissionStatus,
} from './entities/project-lab-submission.entity';
import { CreateProjectLabDto } from './dto/create-project-lab.dto';
import { UpdateProjectLabDto } from './dto/update-project-lab.dto';
import { CreateProjectLabSubmissionDto } from './dto/create-project-lab-submission.dto';
import { UpdateProjectLabSubmissionDto } from './dto/update-project-lab-submission.dto';

@Injectable()
export class ProjectLabsService {
  constructor(
    @InjectRepository(ProjectLab)
    private readonly projectRepo: Repository<ProjectLab>,
    @InjectRepository(ProjectLabSubmission)
    private readonly submissionsRepo: Repository<ProjectLabSubmission>,
  ) {}

  async create(dto: CreateProjectLabDto) {
    const project = this.projectRepo.create({
      ...dto,
      isActive: true,
    });
    return this.projectRepo.save(project);
  }

  async findDomains() {
    const rows = await this.projectRepo
      .createQueryBuilder('project')
      .select(['project.domainId'])
      .addSelect('COUNT(*)', 'count')
      .where('project.isActive = :isActive', { isActive: true })
      .groupBy('project.domainId')
      .orderBy('project.domainId', 'ASC')
      .getRawMany();

    return rows.map((row) => ({
      domainId: row.project_domainId,
      count: Number(row.count) || 0,
    }));
  }

  async findAll(domainId?: string) {
    const where: Record<string, any> = { isActive: true };
    if (domainId) {
      where.domainId = domainId;
    }
    return this.projectRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findAdminAll() {
    return this.projectRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project lab ${id} not found`);
    }
    return project;
  }

  async update(id: string, dto: UpdateProjectLabDto) {
    const project = await this.findOne(id);
    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    project.isActive = false;
    return this.projectRepo.save(project);
  }

  async submit(
    userId: string,
    projectId: string,
    dto: CreateProjectLabSubmissionDto,
  ) {
    const project = await this.findOne(projectId);
    if (!project.isActive) {
      throw new BadRequestException('Project is not available.');
    }

    const existing = await this.submissionsRepo.findOne({
      where: { userId, projectId },
      order: { submittedAt: 'DESC' },
    });

    if (existing && existing.status === ProjectLabSubmissionStatus.SUBMITTED) {
      throw new BadRequestException('Submission already received.');
    }

    const submission = this.submissionsRepo.create({
      projectId,
      userId,
      repositoryUrl: dto.repositoryUrl,
      liveDemoUrl: dto.liveDemoUrl || null,
      status: ProjectLabSubmissionStatus.SUBMITTED,
      submittedAt: new Date(),
      reviewedAt: null,
      completedAt: null,
    });
    return this.submissionsRepo.save(submission);
  }

  async getMySubmissions(userId: string) {
    return this.submissionsRepo.find({
      where: { userId },
      order: { submittedAt: 'DESC' },
    });
  }

  async getMyProgress(userId: string) {
    const submissions = await this.submissionsRepo.find({
      where: { userId },
    });
    const completed = submissions.filter(
      (s) =>
        s.status === ProjectLabSubmissionStatus.COMPLETED ||
        s.status === ProjectLabSubmissionStatus.APPROVED,
    );
    return {
      submittedProjectIds: submissions.map((s) => s.projectId),
      completedProjectIds: completed.map((s) => s.projectId),
    };
  }

  async updateSubmission(id: string, dto: UpdateProjectLabSubmissionDto) {
    const submission = await this.submissionsRepo.findOne({ where: { id } });
    if (!submission) {
      throw new NotFoundException(`Submission ${id} not found`);
    }
    Object.assign(submission, dto);
    if (
      dto.status === ProjectLabSubmissionStatus.APPROVED &&
      !submission.completedAt
    ) {
      submission.completedAt = new Date();
    }
    if (dto.status === ProjectLabSubmissionStatus.REJECTED) {
      submission.reviewedAt = new Date();
    }
    if (
      dto.status === ProjectLabSubmissionStatus.APPROVED ||
      dto.status === ProjectLabSubmissionStatus.COMPLETED
    ) {
      submission.reviewedAt = submission.reviewedAt || new Date();
    }
    return this.submissionsRepo.save(submission);
  }
}
