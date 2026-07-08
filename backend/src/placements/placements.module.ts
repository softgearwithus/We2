import { Module } from '@nestjs/common';
import { PlacementsService } from './placements.service';
import { PlacementsController } from './placements.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Placement } from './entities/placement.entity';
import { HiringAssessment } from './entities/hiring-assessment.entity';
import { HiringAssessmentPlacementLink } from './entities/hiring-assessment-placement-link.entity';
import { User } from '../users/user.entity';
import { Application } from '../applications/entities/application.entity';
import { GithubRepository } from '../integrations/entities/github-repository.entity';
import { CompanySettingsModule } from '../company-settings/company-settings.module';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    CompanySettingsModule,
    ApplicationsModule,
    TypeOrmModule.forFeature([
      Placement,
      User,
      Application,
      HiringAssessment,
      HiringAssessmentPlacementLink,
      GithubRepository,
    ]),
  ],
  controllers: [PlacementsController],
  providers: [PlacementsService],
})
export class PlacementsModule {}
