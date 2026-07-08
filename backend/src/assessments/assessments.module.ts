import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { HiringAssessment } from '../placements/entities/hiring-assessment.entity';
import { HiringAssessmentPlacementLink } from '../placements/entities/hiring-assessment-placement-link.entity';
import { Placement } from '../placements/entities/placement.entity';
import { GithubRepository } from '../integrations/entities/github-repository.entity';
import { AssessmentGenerationRun } from './entities/assessment-generation-run.entity';
import { AssessmentAiService } from '../common/assessment-ai.service';
import { CompanySettingsModule } from '../company-settings/company-settings.module';

@Module({
  imports: [
    CompanySettingsModule,
    TypeOrmModule.forFeature([
      HiringAssessment,
      HiringAssessmentPlacementLink,
      Placement,
      GithubRepository,
      AssessmentGenerationRun,
    ]),
  ],
  controllers: [AssessmentsController],
  providers: [AssessmentsService, AssessmentAiService],
  exports: [AssessmentsService],
})
export class AssessmentsModule {}
