import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Resume } from './entities/resume.entity';
import { User } from '../users/user.entity';
import { ResumeAtsService } from './resume-ats.service';

export interface ResumeAnalysisResult {
  score: number;
  confidence?: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  matchedSkills?: string[];
  missingSkills?: string[];
  evidenceSnippets?: Array<{ label: string; snippet: string }>;
  method?: string;
}

@Injectable()
export class ResumeService {
  constructor(
    @InjectRepository(Resume)
    private resumeRepo: Repository<Resume>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly resumeAtsService: ResumeAtsService,
  ) {}

  async analyzeResume(userId: string, buffer: Buffer, jobDescription?: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isPro =
      user.subscriptionStatus === 'active' && user.subscriptionPlan === 'pro';
    if (!isPro) {
      throw new ForbiddenException(
        'Pro subscription required for ATS resume scan.',
      );
    }

    const limit = 12;
    if (user.resumeScanUsage >= limit) {
      throw new ForbiddenException(
        `Monthly resume ATS scan limit exhausted (${user.resumeScanUsage}/${limit}).`,
      );
    }

    const result = await this.resumeAtsService.analyzePdf({
      buffer,
      jobDescription,
      useAi: true,
    });

    user.resumeScanUsage++;
    await this.userRepo.save(user);
    return result.analysis;
  }

  async getAllResumes(userId: string) {
    return this.resumeRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async getResumeById(id: string, userId: string) {
    const resume = await this.resumeRepo.findOne({ where: { id, userId } });
    if (!resume) {
      throw new NotFoundException('Resume not found');
    }
    return resume;
  }

  async createResume(
    userId: string,
    title: string,
    data?: Record<string, unknown>,
  ) {
    const resume = this.resumeRepo.create({
      userId,
      title,
      data: data || {}, // initialize with empty object if no data provided initially
    });

    try {
      return await this.resumeRepo.save(resume);
    } catch (error: unknown) {
      const isUniqueViolation =
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505' &&
        String(
          (error.driverError as { detail?: string })?.detail || '',
        ).includes('("userId")');

      if (!isUniqueViolation) {
        throw error;
      }

      const existingResume = await this.resumeRepo.findOne({
        where: { userId },
        order: { updatedAt: 'DESC' },
      });

      if (!existingResume) {
        throw error;
      }

      existingResume.title = title;
      existingResume.data = data || {};
      return this.resumeRepo.save(existingResume);
    }
  }

  async updateResume(
    id: string,
    userId: string,
    updateData: { title?: string; data?: Record<string, unknown> },
  ) {
    const resume = await this.getResumeById(id, userId);

    if (updateData.title !== undefined) {
      resume.title = updateData.title;
    }
    if (updateData.data !== undefined) {
      resume.data = updateData.data;
    }

    return this.resumeRepo.save(resume);
  }

  async deleteResume(id: string, userId: string) {
    const resume = await this.getResumeById(id, userId);
    await this.resumeRepo.remove(resume);
    return { message: 'Resume deleted successfully' };
  }
}
