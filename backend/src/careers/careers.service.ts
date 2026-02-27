import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Career } from './entities/career.entity';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';

@Injectable()
export class CareersService {
    constructor(
        @InjectRepository(Career)
        private readonly careerRepository: Repository<Career>,
    ) { }

    async create(createCareerDto: CreateCareerDto): Promise<Career> {
        const career = this.careerRepository.create(createCareerDto);
        return await this.careerRepository.save(career);
    }

    async findAll(activeOnly: boolean = false): Promise<Career[]> {
        const query = this.careerRepository.createQueryBuilder('career');

        if (activeOnly) {
            query.where('career.isActive = :isActive', { isActive: true });
        }

        query.orderBy('career.createdAt', 'DESC');

        return await query.getMany();
    }

    async findOne(id: string): Promise<Career> {
        const career = await this.careerRepository.findOne({ where: { id } });
        if (!career) {
            throw new NotFoundException(`Career with ID ${id} not found`);
        }
        return career;
    }

    async update(id: string, updateCareerDto: UpdateCareerDto): Promise<Career> {
        const career = await this.findOne(id);
        Object.assign(career, updateCareerDto);
        return await this.careerRepository.save(career);
    }

    async remove(id: string): Promise<void> {
        const career = await this.findOne(id);
        await this.careerRepository.remove(career);
    }
}
