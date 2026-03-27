import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Placement } from '../placements/entities/placement.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(Placement)
    private placementsRepository: Repository<Placement>,
  ) {}

  async apply(studentId: string, createDto: CreateApplicationDto) {
    // Prevent duplicate applications
    const existing = await this.applicationsRepository.findOne({
      where: { studentId, placementId: createDto.placementId },
    });
    if (existing)
      throw new ConflictException('You have already applied to this drive.');

    const app = this.applicationsRepository.create({
      studentId,
      placementId: createDto.placementId,
    });
    return this.applicationsRepository.save(app);
  }

  // For companies: View all applicants to a specific drive they own
  async findByPlacement(placementId: string, companyId: string) {
    // Enforce company ownership
    const placement = await this.placementsRepository.findOne({
      where: { id: placementId },
    });
    if (!placement) throw new NotFoundException('Drive not found');
    if (placement.companyId !== companyId)
      throw new ForbiddenException('Access denied. You do not own this drive.');

    return this.applicationsRepository.find({
      where: { placementId },
      relations: ['student'],
      order: { appliedAt: 'DESC' },
    });
  }

  // ATS: update applicant status
  async updateStatus(id: string, status: any) {
    await this.applicationsRepository.update(id, { status });
    return this.applicationsRepository.findOne({ where: { id } });
  }
}
