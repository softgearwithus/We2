import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseContentController } from './course-content.controller';
import { CourseContentService } from './course-content.service';
import { CourseContent } from './entities/course-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseContent])],
  controllers: [CourseContentController],
  providers: [CourseContentService],
})
export class CourseContentModule {}
