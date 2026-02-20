import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { College } from './college.entity';
import { CreateCollegeDto } from './dto/create-college.dto';

@Injectable()
export class CollegesService {
    constructor(
        @InjectRepository(College)
        private collegesRepository: Repository<College>,
    ) {}

    async create(dto: CreateCollegeDto) {
        const existing = await this.collegesRepository.findOne({ where: { name: dto.name } });
        if (existing) {
            throw new ConflictException('College already exists');
        }
        const college = this.collegesRepository.create({
            name: dto.name,
            code: dto.code?.trim() || null,
            city: dto.city?.trim() || null,
            state: dto.state?.trim() || null,
            contactEmail: dto.contactEmail?.trim() || null,
        });
        return this.collegesRepository.save(college);
    }

    async findAll() {
        return this.collegesRepository.find({ order: { createdAt: 'DESC' } });
    }
}
