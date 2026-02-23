import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from '../admin/admin.service';
import { CreateMcqQuestionDto } from './dto/create-mcq-question.dto';
import { ImportMcqsDto } from './dto/import-mcqs.dto';
import { ListMcqQueryDto, McqOrder } from './dto/list-mcq-query.dto';
import { AdminMcqQueryDto } from './dto/admin-mcq-query.dto';
import { AdminDeleteMcqQueryDto } from './dto/admin-delete-mcq-query.dto';
import { UpdateMcqQuestionDto } from './dto/update-mcq-question.dto';
import { McqQuestion, McqCategory } from './entities/mcq-question.entity';

@Injectable()
export class McqsService {
    constructor(
        @InjectRepository(McqQuestion)
        private readonly mcqRepo: Repository<McqQuestion>,
        private readonly adminService: AdminService,
    ) { }

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

        const question = this.mcqRepo.create({
            category: dto.category,
            groupLabel,
            groupKey,
            question: dto.question.trim(),
            options,
            correctOptionIndex: dto.correctOptionIndex,
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

        const qb = this.mcqRepo.createQueryBuilder('mcq')
            .where('mcq.category = :category', { category: query.category })
            .andWhere('mcq.groupKey = :groupKey', { groupKey: this.normalizeKey(query.groupKey) })
            .skip((page - 1) * limit)
            .take(limit);

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
            qb.andWhere('mcq.groupKey = :groupKey', { groupKey: this.normalizeKey(query.groupKey) });
        }
        if (query.search) {
            qb.andWhere('(mcq.question ILIKE :search OR mcq.groupLabel ILIKE :search)', {
                search: `%${query.search}%`,
            });
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

        if (dto.category) {
            question.category = dto.category;
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
            if (dto.correctOptionIndex !== undefined && dto.correctOptionIndex >= options.length) {
                throw new BadRequestException('correctOptionIndex is out of range');
            }
            if (dto.correctOptionIndex === undefined && question.correctOptionIndex >= options.length) {
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

        const saved = await this.mcqRepo.save(question);
        await this.adminService.logAction({
            action: 'MCQ Updated',
            target: saved.groupLabel,
            severity: 'info',
            metadata: { id: saved.id },
        });
        return saved;
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
        const qb = this.mcqRepo.createQueryBuilder('mcq');

        if (query.category) {
            qb.andWhere('mcq.category = :category', { category: query.category });
        }
        if (query.groupKey) {
            qb.andWhere('mcq.groupKey = :groupKey', { groupKey: this.normalizeKey(query.groupKey) });
        }
        if (query.search) {
            qb.andWhere('(mcq.question ILIKE :search OR mcq.groupLabel ILIKE :search)', {
                search: `%${query.search}%`,
            });
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
    }

    async groups(category: McqCategory) {
        const rows = await this.mcqRepo.createQueryBuilder('mcq')
            .select('mcq.groupKey', 'groupKey')
            .addSelect('mcq.groupLabel', 'groupLabel')
            .addSelect('COUNT(mcq.id)', 'count')
            .where('mcq.category = :category', { category })
            .groupBy('mcq.groupKey')
            .addGroupBy('mcq.groupLabel')
            .orderBy('mcq.groupLabel', 'ASC')
            .getRawMany<{ groupKey: string; groupLabel: string; count: string }>();

        return rows.map((row) => ({
            key: row.groupKey,
            label: row.groupLabel,
            count: parseInt(row.count, 10),
        }));
    }

    async importFromCsv(csv: string) {
        const rows = this.parseCsv(csv);
        const created: McqQuestion[] = [];
        for (const row of rows) {
            const dto: CreateMcqQuestionDto = {
                category: row.category as McqCategory,
                group: row.group,
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
            throw new BadRequestException('CSV must include header and at least one row');
        }

        const headers = this.parseCsvLine(lines[0]);
        const required = ['category', 'group', 'question', 'options', 'correctOptionIndex'];
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
