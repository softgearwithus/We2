import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './entities/application.entity';
import { Placement } from '../placements/entities/placement.entity';
import { HiringAssessment } from '../placements/entities/hiring-assessment.entity';
import { HiringAssessmentPlacementLink } from '../placements/entities/hiring-assessment-placement-link.entity';
import { CompanySettingsModule } from '../company-settings/company-settings.module';
import { AuthModule } from '../auth/auth.module';
import { ResumeModule } from '../resume/resume.module';
import { AdminSettingsModule } from '../admin-settings/admin-settings.module';

@Module({
  imports: [
    CompanySettingsModule,
    AuthModule,
    ResumeModule,
    AdminSettingsModule,
    TypeOrmModule.forFeature([
      Application,
      Placement,
      HiringAssessment,
      HiringAssessmentPlacementLink,
    ]),
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
