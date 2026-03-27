import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from '../admin/admin.service';
import { CreateMcqQuestionDto } from './dto/create-mcq-question.dto';
import { ImportMcqsDto } from './dto/import-mcqs.dto';
import { ListMcqQueryDto, McqOrder } from './dto/list-mcq-query.dto';
import { AdminMcqQueryDto } from './dto/admin-mcq-query.dto';
import { AdminDeleteMcqQueryDto } from './dto/admin-delete-mcq-query.dto';
import { AdminUpdateDurationDto } from './dto/admin-update-duration.dto';
import { UpdateMcqQuestionDto } from './dto/update-mcq-question.dto';
import { McqQuestion, McqCategory } from './entities/mcq-question.entity';

@Injectable()
export class McqsService {
  constructor(
    @InjectRepository(McqQuestion)
    private readonly mcqRepo: Repository<McqQuestion>,
    private readonly adminService: AdminService,
  ) {}

  async create(dto: CreateMcqQuestionDto) {
    const options = dto.options.map((opt) => opt.trim()).filter(Boolean);
    if (options.length < 2) {
      throw new BadRequestException('At least two options are required');
    }
    if (dto.correctOptionIndex >= options.length) {
      throw new BadRequestException('correctOptionIndex is out of range');
    }

    const groupLabel = dto.group.trim();
    const groupKey = this.normalizeKey(dto.group);
    const topicLabel = dto.topic ? dto.topic.trim() : null;
    const topicKey = dto.topic ? this.normalizeKey(dto.topic) : null;
    if (dto.category === McqCategory.COMPANY && !topicLabel) {
      throw new BadRequestException('Topic is required for company MCQs');
    }

    const question = this.mcqRepo.create({
      category: dto.category,
      groupLabel,
      groupKey,
      topicLabel: topicLabel || null,
      topicKey: topicKey || null,
      question: dto.question.trim(),
      options,
      correctOptionIndex: dto.correctOptionIndex,
      topicDurationMinutes: dto.topicDurationMinutes ?? 60,
    });
    const saved = await this.mcqRepo.save(question);
    await this.adminService.logAction({
      action: 'MCQ Created',
      target: saved.groupLabel,
      severity: 'info',
      metadata: { id: saved.id },
    });
    return saved;
  }

  async list(query: ListMcqQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const order = query.order || McqOrder.LATEST;

    const qb = this.mcqRepo
      .createQueryBuilder('mcq')
      .where('mcq.category = :category', { category: query.category })
      .andWhere('mcq.groupKey = :groupKey', {
        groupKey: this.normalizeKey(query.groupKey),
      });

    if (query.topicKey) {
      const topicKey = this.normalizeKey(query.topicKey);
      if (topicKey === 'general') {
        qb.andWhere('(mcq.topicKey = :topicKey OR mcq.topicKey IS NULL)', {
          topicKey,
        });
      } else {
        qb.andWhere('mcq.topicKey = :topicKey', { topicKey });
      }
    }

    qb.skip((page - 1) * limit).take(limit);

    if (order === McqOrder.RANDOM) {
      qb.orderBy('RANDOM()');
    } else if (order === McqOrder.OLDEST) {
      qb.orderBy('mcq.createdAt', 'ASC');
    } else {
      qb.orderBy('mcq.createdAt', 'DESC');
    }

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page,
      limit,
      hasNext: page * limit < total,
    };
  }

  async adminList(query: AdminMcqQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const order = query.order || McqOrder.LATEST;

    const qb = this.mcqRepo.createQueryBuilder('mcq');

    if (query.category) {
      qb.andWhere('mcq.category = :category', { category: query.category });
    }
    if (query.groupKey) {
      qb.andWhere('mcq.groupKey = :groupKey', {
        groupKey: this.normalizeKey(query.groupKey),
      });
    }
    if (query.topicKey) {
      const topicKey = this.normalizeKey(query.topicKey);
      if (topicKey === 'general') {
        qb.andWhere('(mcq.topicKey = :topicKey OR mcq.topicKey IS NULL)', {
          topicKey,
        });
      } else {
        qb.andWhere('mcq.topicKey = :topicKey', { topicKey });
      }
    }
    if (query.search) {
      qb.andWhere(
        '(mcq.question ILIKE :search OR mcq.groupLabel ILIKE :search)',
        {
          search: `%${query.search}%`,
        },
      );
    }

    if (order === McqOrder.RANDOM) {
      qb.orderBy('RANDOM()');
    } else if (order === McqOrder.OLDEST) {
      qb.orderBy('mcq.createdAt', 'ASC');
    } else {
      qb.orderBy('mcq.createdAt', 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page,
      limit,
      hasNext: page * limit < total,
    };
  }

  async update(id: string, dto: UpdateMcqQuestionDto) {
    const question = await this.mcqRepo.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException('MCQ not found');
    }

    const groupValue = typeof dto.group === 'string' ? dto.group.trim() : '';
    if (groupValue) {
      question.groupLabel = groupValue;
      question.groupKey = this.normalizeKey(groupValue);
    }

    const topicValue = typeof dto.topic === 'string' ? dto.topic.trim() : '';
    if (topicValue) {
      question.topicLabel = topicValue;
      question.topicKey = this.normalizeKey(topicValue);
    }

    if (dto.category) {
      question.category = dto.category;
    }

    if (dto.topicDurationMinutes !== undefined) {
      question.topicDurationMinutes = dto.topicDurationMinutes;
    }

    if (
      question.category === McqCategory.COMPANY &&
      !question.topicLabel &&
      !dto.topic
    ) {
      throw new BadRequestException('Topic is required for company MCQs');
    }

    if (typeof dto.question === 'string' && dto.question.trim()) {
      question.question = dto.question.trim();
    }

    if (dto.options) {
      const options = dto.options.map((opt) => opt.trim()).filter(Boolean);
      if (options.length < 2) {
        throw new BadRequestException('At least two options are required');
      }
      question.options = options;
      if (
        dto.correctOptionIndex !== undefined &&
        dto.correctOptionIndex >= options.length
      ) {
        throw new BadRequestException('correctOptionIndex is out of range');
      }
      if (
        dto.correctOptionIndex === undefined &&
        question.correctOptionIndex >= options.length
      ) {
        question.correctOptionIndex = 0;
      }
    }

    if (dto.correctOptionIndex !== undefined) {
      const optionsLength = question.options?.length || 0;
      if (dto.correctOptionIndex >= optionsLength) {
        throw new BadRequestException('correctOptionIndex is out of range');
      }
      question.correctOptionIndex = dto.correctOptionIndex;
    }

    if (dto.isNew !== undefined) {
      question.isNew = dto.isNew;
    }

    const saved = await this.mcqRepo.save(question);
    await this.adminService.logAction({
      action: 'MCQ Updated',
      target: saved.groupLabel,
      severity: 'info',
      metadata: { id: saved.id },
    });
    return saved;
  }

  async findOne(id: string) {
    const question = await this.mcqRepo.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException('MCQ not found');
    }
    return question;
  }

  async remove(id: string) {
    const question = await this.mcqRepo.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException('MCQ not found');
    }
    await this.mcqRepo.remove(question);
    await this.adminService.logAction({
      action: 'MCQ Deleted',
      target: question.groupLabel,
      severity: 'warning',
      metadata: { id: question.id },
    });
    return { success: true };
  }

  async bulkRemove(query: AdminDeleteMcqQueryDto) {
    try {
      const qb = this.mcqRepo.createQueryBuilder('mcq');

      if (query.category) {
        qb.andWhere('mcq.category = :category', { category: query.category });
      }
      if (query.groupKey) {
        qb.andWhere('mcq.groupKey = :groupKey', {
          groupKey: this.normalizeKey(query.groupKey),
        });
      }
      if (query.topicKey) {
        const topicKey = this.normalizeKey(query.topicKey);
        if (topicKey === 'general') {
          qb.andWhere('(mcq.topicKey = :topicKey OR mcq.topicKey IS NULL)', {
            topicKey,
          });
        } else {
          qb.andWhere('mcq.topicKey = :topicKey', { topicKey });
        }
      }
      if (query.search) {
        qb.andWhere(
          '(mcq.question ILIKE :search OR mcq.groupLabel ILIKE :search)',
          {
            search: `%${query.search}%`,
          },
        );
      }

      const ids = await qb.select('mcq.id', 'id').getRawMany<{ id: string }>();
      if (ids.length === 0) {
        return { deletedCount: 0 };
      }

      await this.mcqRepo.delete(ids.map((row) => row.id));
      await this.adminService.logAction({
        action: 'MCQ Bulk Deleted',
        target: query.groupKey || query.category || 'filtered',
        severity: 'warning',
        metadata: { deletedCount: ids.length },
      });
      return { deletedCount: ids.length };
    } catch (e: any) {
      throw new InternalServerErrorException(
        `Delete Error: ${e.message} \n ${e.stack}`,
      );
    }
  }

  async bulkUpdateDuration(dto: AdminUpdateDurationDto) {
    try {
      const qb = this.mcqRepo.createQueryBuilder('mcq');

      if (dto.category) {
        qb.andWhere('mcq.category = :category', { category: dto.category });
      }
      if (dto.groupKey) {
        qb.andWhere('mcq.groupKey = :groupKey', {
          groupKey: this.normalizeKey(dto.groupKey),
        });
      }
      if (dto.topicKey) {
        const topicKey = this.normalizeKey(dto.topicKey);
        if (topicKey === 'general') {
          qb.andWhere('(mcq.topicKey = :topicKey OR mcq.topicKey IS NULL)', {
            topicKey,
          });
        } else {
          qb.andWhere('mcq.topicKey = :topicKey', { topicKey });
        }
      }

      const ids = await qb.select('mcq.id', 'id').getRawMany<{ id: string }>();
      if (ids.length === 0) {
        return { updatedCount: 0 };
      }

      await this.mcqRepo.update(
        ids.map((row) => row.id),
        { topicDurationMinutes: dto.durationMinutes },
      );
      return { updatedCount: ids.length };
    } catch (e: any) {
      throw new InternalServerErrorException(
        `Duration Error: ${e.message} \n ${e.stack}`,
      );
    }
  }

  async groups(
    category: McqCategory,
    groupBy: 'group' | 'topic' = 'group',
    groupKey?: string,
  ) {
    const qb = this.mcqRepo
      .createQueryBuilder('mcq')
      .where('mcq.category = :category', { category });

    if (groupKey) {
      qb.andWhere('mcq.groupKey = :groupKey', {
        groupKey: this.normalizeKey(groupKey),
      });
    }

    if (groupBy === 'topic') {
      qb.select('COALESCE(mcq.topicKey, :fallbackKey)', 'groupKey')
        .addSelect('COALESCE(mcq.topicLabel, :fallbackLabel)', 'groupLabel')
        .addSelect('COUNT(mcq.id)', 'count')
        .addSelect('MAX(mcq.topicDurationMinutes)', 'durationMinutes')
        .addSelect('MAX(mcq.createdAt)', 'createdAt')
        .setParameter('fallbackKey', 'general')
        .setParameter('fallbackLabel', 'General')
        .groupBy('mcq.topicKey')
        .addGroupBy('mcq.topicLabel')
        .orderBy('"groupLabel"', 'ASC');
    } else {
      qb.select('mcq.groupKey', 'groupKey')
        .addSelect('mcq.groupLabel', 'groupLabel')
        .addSelect('COUNT(mcq.id)', 'count')
        .addSelect('MAX(mcq.topicDurationMinutes)', 'durationMinutes')
        .addSelect('MAX(mcq.createdAt)', 'createdAt')
        .groupBy('mcq.groupKey')
        .addGroupBy('mcq.groupLabel')
        .orderBy('"groupLabel"', 'ASC');
    }

    const rows = await qb.getRawMany<{
      groupKey: string;
      groupLabel: string;
      count: string;
      durationMinutes: number;
      createdAt: Date;
    }>();

    return rows.map((row) => ({
      key: row.groupKey,
      label: row.groupLabel,
      count: parseInt(row.count, 10),
      durationMinutes: row.durationMinutes || 60,
      createdAt: row.createdAt,
    }));
  }

  async importFromCsv(csv: string) {
    const rows = this.parseCsv(csv);
    const created: McqQuestion[] = [];
    for (const row of rows) {
      const dto: CreateMcqQuestionDto = {
        category: row.category as McqCategory,
        group: row.group,
        topic: row.topic || undefined,
        question: row.question,
        options: row.options,
        correctOptionIndex: row.correctOptionIndex,
      };
      created.push(await this.create(dto));
    }
    return { created: created.length };
  }

  private parseCsv(csv: string) {
    const lines = csv
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new BadRequestException(
        'CSV must include header and at least one row',
      );
    }

    const headers = this.parseCsvLine(lines[0]);
    const required = [
      'category',
      'group',
      'question',
      'options',
      'correctOptionIndex',
    ];
    for (const key of required) {
      if (!headers.includes(key)) {
        throw new BadRequestException(`Missing required column: ${key}`);
      }
    }

    return lines.slice(1).map((line) => {
      const values = this.parseCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      const options = row.options
        .split('|')
        .map((opt) => opt.trim())
        .filter(Boolean);

      const correctOptionIndex = parseInt(row.correctOptionIndex, 10);
      if (Number.isNaN(correctOptionIndex)) {
        throw new BadRequestException('correctOptionIndex must be a number');
      }

      return {
        category: row.category,
        group: row.group,
        topic: row.topic,
        question: row.question,
        options,
        correctOptionIndex,
      };
    });
  }

  private normalizeKey(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private parseCsvLine(line: string) {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
        continue;
      }
      current += char;
    }
    result.push(current);
    return result.map((value) => value.trim());
  }
}
