import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreparationProgress } from './entities/preparation-progress.entity';

@Injectable()
export class PreparationService {
  constructor(
    @InjectRepository(PreparationProgress)
    private readonly progressRepo: Repository<PreparationProgress>,
  ) {}

  async getProgress(userId: string) {
    let progress = await this.progressRepo.findOne({ where: { userId } });
    if (!progress) {
      progress = this.progressRepo.create({ userId, completedPhaseIds: [] });
      progress = await this.progressRepo.save(progress);
    }
    return progress;
  }

  async updateProgress(userId: string, completedPhaseIds: string[]) {
    const progress = await this.getProgress(userId);
    progress.completedPhaseIds = completedPhaseIds;
    return this.progressRepo.save(progress);
  }
}
