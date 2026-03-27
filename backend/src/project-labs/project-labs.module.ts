import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectLabsService } from './project-labs.service';
import { ProjectLabsController } from './project-labs.controller';
import { ProjectLab } from './entities/project-lab.entity';
import { ProjectLabSubmission } from './entities/project-lab-submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectLab, ProjectLabSubmission])],
  controllers: [ProjectLabsController],
  providers: [ProjectLabsService],
  exports: [ProjectLabsService],
})
export class ProjectLabsModule {}
