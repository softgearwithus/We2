import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable()
export class TestimonialsService {
    constructor(
        @InjectRepository(Testimonial)
        private testimonialRepository: Repository<Testimonial>,
    ) {}

    async create(dto: CreateTestimonialDto) {
        const testimonial = this.testimonialRepository.create({
            name: dto.name,
            role: dto.role,
            image: dto.image,
            package: dto.package || null,
            text: dto.text,
            verified: dto.verified ?? true,
            isFeatured: dto.isFeatured ?? false,
            isActive: dto.isActive ?? true,
            sortOrder: dto.sortOrder ?? 0,
        });
        return this.testimonialRepository.save(testimonial);
    }

    async findAll() {
        return this.testimonialRepository.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
    }

    async findActive() {
        return this.testimonialRepository.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    async update(id: string, dto: UpdateTestimonialDto) {
        const testimonial = await this.testimonialRepository.findOne({ where: { id } });
        if (!testimonial) {
            throw new NotFoundException('Testimonial not found');
        }
        Object.assign(testimonial, dto);
        return this.testimonialRepository.save(testimonial);
    }

    async remove(id: string) {
        const testimonial = await this.testimonialRepository.findOne({ where: { id } });
        if (!testimonial) {
            throw new NotFoundException('Testimonial not found');
        }
        await this.testimonialRepository.remove(testimonial);
        return { deleted: true };
    }
}
