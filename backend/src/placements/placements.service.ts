import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { UpdatePlacementDto } from './dto/update-placement.dto';
import { Placement, PlacementStatus, PlacementType, DriveVerificationStatus } from './entities/placement.entity';
import { User } from '../users/user.entity';

@Injectable()
export class PlacementsService {

  constructor(
    @InjectRepository(Placement)
    private readonly placementRepo: Repository<Placement>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>
  ) { }

  async create(createPlacementDto: CreatePlacementDto): Promise<Placement> {
    if (createPlacementDto.companyId) {
      const user = await this.usersRepo.findOne({ where: { id: createPlacementDto.companyId } });
      if (user && user.subscriptionPlan === 'free') {
        const drivesCount = await this.placementRepo.count({ where: { companyId: user.id } });
        if (drivesCount >= 1) {
          throw new ForbiddenException('Free tier is limited to 1 placement drive. Please contact sales to upgrade your pipeline limit.');
        }
      }
    }

    const placement = this.placementRepo.create(createPlacementDto);
    return await this.placementRepo.save(placement);
  }

  async findMyDrives(companyId: string): Promise<Placement[]> {
    return await this.placementRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' }
    });
  }

  async findAll(type?: PlacementType, status?: PlacementStatus, isSuperAdmin: boolean = false): Promise<Placement[]> {
    const query = this.placementRepo.createQueryBuilder('placement');

    if (type) {
      query.andWhere('placement.type = :type', { type });
    }
    if (status) {
      query.andWhere('placement.status = :status', { status });
    }
    if (!isSuperAdmin) {
      query.andWhere('placement.verificationStatus = :vStatus', { vStatus: DriveVerificationStatus.APPROVED });
    }

    // Order by newest first
    query.orderBy('placement.createdAt', 'DESC');

    return await query.getMany();
  }

  async verifyDrive(id: string, verificationStatus: DriveVerificationStatus, rejectionReason?: string): Promise<Placement> {
    const placement = await this.findOne(id);
    placement.verificationStatus = verificationStatus;
    if (rejectionReason !== undefined) {
      placement.rejectionReason = rejectionReason;
    }
    return await this.placementRepo.save(placement);
  }

  async findOne(id: string): Promise<Placement> {
    const placement = await this.placementRepo.findOne({ where: { id } });
    if (!placement) {
      throw new NotFoundException(`Placement Drive with ID ${id} not found`);
    }
    return placement;
  }

  async update(id: string, updatePlacementDto: UpdatePlacementDto): Promise<Placement> {
    const placement = await this.findOne(id);
    Object.assign(placement, updatePlacementDto);
    return await this.placementRepo.save(placement);
  }

  async remove(id: string): Promise<void> {
    const placement = await this.findOne(id);
    await this.placementRepo.remove(placement);
  }
}
