import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { GithubInstallation } from './entities/github-installation.entity';
import { GithubRepository } from './entities/github-repository.entity';
import { AssessmentAiService } from '../common/assessment-ai.service';
import { CompanySettingsModule } from '../company-settings/company-settings.module';

@Module({
  imports: [
    ConfigModule,
    CompanySettingsModule,
    TypeOrmModule.forFeature([GithubInstallation, GithubRepository]),
  ],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, AssessmentAiService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
