import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Performance,
  PerformanceCategory,
} from './entities/performance.entity';
import { CreatePerformanceDto } from './dto/create-performance.dto';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(Performance)
    private perfRepo: Repository<Performance>,
  ) {}

  /**
   * Record a new performance evaluation
   */
  async create(dto: CreatePerformanceDto): Promise<Performance> {
    const record = this.perfRepo.create({
      ...dto,
      evaluatedAt: new Date(),
    });
    return this.perfRepo.save(record);
  }

  /**
   * Get all performance records for the current user
   */
  async findByUser(userId: string): Promise<Performance[]> {
    return this.perfRepo.find({
      where: { userId },
      order: { evaluatedAt: 'DESC' },
    });
  }

  /**
   * Get performance records for a specific simulation
   */
  async findBySimulation(
    simulationId: string,
    userId: string,
  ): Promise<Performance[]> {
    return this.perfRepo.find({
      where: { simulationId, userId },
      order: { evaluatedAt: 'DESC' },
    });
  }

  /**
   * Get a single performance record
   */
  async findOne(id: string): Promise<Performance> {
    const record = await this.perfRepo.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Performance record ${id} not found`);
    }
    return record;
  }

  /**
   * Calculate aggregate metrics for a user
   */
  async getMetrics(userId: string) {
    const records = await this.findByUser(userId);

    if (records.length === 0) {
      return {
        overall: 0,
        totalEvaluations: 0,
        byCategory: {},
      };
    }

    // Group by category and calculate averages
    const byCategory: Record<string, { average: number; count: number }> = {};

    for (const cat of Object.values(PerformanceCategory)) {
      const catRecords = records.filter((r) => r.category === cat);
      if (catRecords.length > 0) {
        byCategory[cat] = {
          average:
            Math.round(
              (catRecords.reduce((sum, r) => sum + r.score, 0) /
                catRecords.length) *
                10,
            ) / 10,
          count: catRecords.length,
        };
      }
    }

    const overall =
      Math.round(
        (records.reduce((sum, r) => sum + r.score, 0) / records.length) * 10,
      ) / 10;

    return {
      overall,
      totalEvaluations: records.length,
      byCategory,
      recentScores: records.slice(0, 10).map((r) => ({
        category: r.category,
        score: r.score,
        evaluatedAt: r.evaluatedAt,
      })),
    };
  }
}
