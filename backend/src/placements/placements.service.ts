import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { UpdatePlacementDto } from './dto/update-placement.dto';
import {
  Placement,
  PlacementStatus,
  PlacementType,
  DriveVerificationStatus,
  WorkMode,
} from './entities/placement.entity';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class PlacementsService {
  constructor(
    @InjectRepository(Placement)
    private readonly placementRepo: Repository<Placement>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(createPlacementDto: CreatePlacementDto): Promise<Placement> {
    if (createPlacementDto.companyId) {
      const user = await this.usersRepo.findOne({
        where: { id: createPlacementDto.companyId },
      });
      if (user && user.subscriptionPlan === 'free') {
        const drivesCount = await this.placementRepo.count({
          where: { companyId: user.id },
        });
        if (drivesCount >= 1) {
          throw new ForbiddenException(
            'Free tier is limited to 1 placement drive. Please contact sales to upgrade your pipeline limit.',
          );
        }
      }
    }

    const placement = this.placementRepo.create(createPlacementDto);
    return await this.placementRepo.save(placement);
  }

  async findMyDrives(companyId: string): Promise<Placement[]> {
    return await this.placementRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(
    type?: PlacementType,
    status?: PlacementStatus,
    isSuperAdmin: boolean = false,
    mode?: WorkMode,
  ): Promise<Placement[]> {
    const query = this.placementRepo.createQueryBuilder('placement');

    if (type) {
      query.andWhere('placement.type = :type', { type });
    }
    if (status) {
      query.andWhere('placement.status = :status', { status });
    }
    if (mode) {
      query.andWhere('placement.workMode = :mode', { mode });
    }
    if (!isSuperAdmin) {
      query.andWhere('placement.verificationStatus = :vStatus', {
        vStatus: DriveVerificationStatus.APPROVED,
      });
    }

    // Order by newest first
    query.orderBy('placement.createdAt', 'DESC');

    return await query.getMany();
  }

  async findPublicActiveJobs(
    type?: PlacementType,
    mode?: WorkMode,
    q?: string,
  ): Promise<Placement[]> {
    const query = this.placementRepo
      .createQueryBuilder('placement')
      .where('placement.verificationStatus = :verificationStatus', {
        verificationStatus: DriveVerificationStatus.APPROVED,
      })
      .andWhere('placement.status = :status', {
        status: PlacementStatus.ACTIVE,
      });

    if (type) {
      query.andWhere('placement.type = :type', { type });
    }

    if (mode) {
      query.andWhere('placement.workMode = :mode', { mode });
    }

    if (q && q.trim()) {
      query.andWhere(
        '(LOWER(placement.title) LIKE :q OR LOWER(placement.companyName) LIKE :q OR LOWER(placement.jobProfile) LIKE :q)',
        { q: `%${q.trim().toLowerCase()}%` },
      );
    }

    return query.orderBy('placement.createdAt', 'DESC').getMany();
  }

  async getPublicActiveJobStats(): Promise<{
    totalActiveJobs: number;
    companiesHiring: number;
  }> {
    const baseQuery = this.placementRepo
      .createQueryBuilder('placement')
      .where('placement.verificationStatus = :verificationStatus', {
        verificationStatus: DriveVerificationStatus.APPROVED,
      })
      .andWhere('placement.status = :status', {
        status: PlacementStatus.ACTIVE,
      });

    const totalActiveJobs = await baseQuery.getCount();

    const companies = await this.placementRepo
      .createQueryBuilder('placement')
      .select('COUNT(DISTINCT placement.companyName)', 'count')
      .where('placement.verificationStatus = :verificationStatus', {
        verificationStatus: DriveVerificationStatus.APPROVED,
      })
      .andWhere('placement.status = :status', {
        status: PlacementStatus.ACTIVE,
      })
      .getRawOne<{ count: string }>();

    return {
      totalActiveJobs,
      companiesHiring: Number(companies?.count || 0),
    };
  }

  async verifyDrive(
    id: string,
    verificationStatus: DriveVerificationStatus,
    rejectionReason?: string,
  ): Promise<Placement> {
    const placement = await this.findOne(id);
    placement.verificationStatus = verificationStatus;
    if (rejectionReason !== undefined) {
      placement.rejectionReason = rejectionReason;
    }
    return await this.placementRepo.save(placement);
  }

  private assertPlacementAccess(
    placement: Placement,
    actorId?: string,
    actorRole?: UserRole,
  ) {
    if (!actorId || !actorRole) {
      return;
    }
    if (actorRole === UserRole.SUPER_ADMIN) {
      return;
    }
    if (
      actorRole === UserRole.COMPANY_ADMIN &&
      placement.companyId !== actorId
    ) {
      throw new ForbiddenException('Access denied. You do not own this drive.');
    }
  }

  async findOne(
    id: string,
    actorId?: string,
    actorRole?: UserRole,
  ): Promise<Placement> {
    const placement = await this.placementRepo.findOne({ where: { id } });
    if (!placement) {
      throw new NotFoundException(`Placement Drive with ID ${id} not found`);
    }
    this.assertPlacementAccess(placement, actorId, actorRole);
    return placement;
  }

  async update(
    id: string,
    updatePlacementDto: UpdatePlacementDto,
    actorId?: string,
    actorRole?: UserRole,
  ): Promise<Placement> {
    const placement = await this.findOne(id, actorId, actorRole);

    if (actorRole === UserRole.COMPANY_ADMIN) {
      delete (updatePlacementDto as Partial<UpdatePlacementDto>).companyId;
      delete (updatePlacementDto as Partial<UpdatePlacementDto>).companyName;
    }

    Object.assign(placement, updatePlacementDto);
    return await this.placementRepo.save(placement);
  }

  async remove(
    id: string,
    actorId?: string,
    actorRole?: UserRole,
  ): Promise<void> {
    const placement = await this.findOne(id, actorId, actorRole);
    await this.placementRepo.remove(placement);
  }
}
