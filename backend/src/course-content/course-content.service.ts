import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseContent } from './entities/course-content.entity';

@Injectable()
export class CourseContentService {
    constructor(
        @InjectRepository(CourseContent)
        private contentRepository: Repository<CourseContent>,
    ) { }

    async createOrUpdate(topicId: string, title: string, content: string) {
        let existing = await this.contentRepository.findOne({ where: { topicId } });

        if (existing) {
            existing.title = title;
            existing.content = content;
            return this.contentRepository.save(existing);
        }

        const newContent = this.contentRepository.create({
            topicId,
            title,
            content,
        });
        return this.contentRepository.save(newContent);
    }

    async findOne(topicId: string) {
        const content = await this.contentRepository.findOne({ where: { topicId } });
        if (!content) {
            throw new NotFoundException(`Content for topic ${topicId} not found`);
        }
        return content;
    }
}
