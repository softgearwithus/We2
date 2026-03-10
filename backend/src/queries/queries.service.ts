import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Query } from './entities/query.entity';
import { CreateQueryDto } from './dto/create-query.dto';

@Injectable()
export class QueriesService {
    constructor(
        @InjectRepository(Query)
        private readonly queryRepository: Repository<Query>,
    ) { }

    async create(createQueryDto: CreateQueryDto): Promise<Query> {
        const query = this.queryRepository.create(createQueryDto);
        return this.queryRepository.save(query);
    }

    async findAll(): Promise<Query[]> {
        return this.queryRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async updateStatus(id: string, status: string): Promise<Query> {
        const query = await this.queryRepository.findOne({ where: { id } });
        if (!query) {
            throw new NotFoundException(`Query #${id} not found`);
        }
        query.status = status;
        return this.queryRepository.save(query);
    }
}
