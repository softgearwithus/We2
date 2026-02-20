import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private reviewRepository: Repository<Review>,
    ) {}

    async create(dto: CreateReviewDto, userId?: string) {
        const review = this.reviewRepository.create({
            title: dto.title,
            description: dto.description,
            type: dto.type,
            source: dto.source || 'student',
            score: dto.score || 0,
            isPublished: dto.isPublished || false,
            isFeatured: dto.isFeatured || false,
            metadata: dto.metadata || null,
            userId: userId || null,
        });
        return this.reviewRepository.save(review);
    }

    async findAll() {
        return this.reviewRepository.find({ order: { createdAt: 'DESC' } });
    }

    async findPublished() {
        return this.reviewRepository.find({
            where: { isPublished: true },
            order: { createdAt: 'DESC' },
        });
    }

    async update(id: string, dto: UpdateReviewDto) {
        const review = await this.reviewRepository.findOne({ where: { id } });
        if (!review) {
            throw new NotFoundException('Review not found');
        }
        Object.assign(review, dto);
        return this.reviewRepository.save(review);
    }

    async remove(id: string) {
        const review = await this.reviewRepository.findOne({ where: { id } });
        if (!review) {
            throw new NotFoundException('Review not found');
        }
        await this.reviewRepository.remove(review);
        return { deleted: true };
    }
}
