import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { CourseContentService } from './course-content.service';

@Controller('course-content')
export class CourseContentController {
    constructor(private readonly courseContentService: CourseContentService) { }

    @Post(':topicId')
    createOrUpdate(
        @Param('topicId') topicId: string,
        @Body('title') title: string,
        @Body('content') content: string,
    ) {
        return this.courseContentService.createOrUpdate(topicId, title, content);
    }

    @Get(':topicId')
    async findOne(@Param('topicId') topicId: string) {
        try {
            return await this.courseContentService.findOne(topicId);
        } catch (error) {
            // Return null or specific structure if content doesn't exist yet, 
            // instead of 404 to avoid frontend error logs for every topic
            if (error instanceof NotFoundException) {
                return null;
            }
            throw error;
        }
    }
}
