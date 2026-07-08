import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/user.entity';
import { Placement } from '../placements/entities/placement.entity';
import { HiringAssessment } from '../placements/entities/hiring-assessment.entity';
import { Application } from '../applications/entities/application.entity';
import { GithubRepository } from '../integrations/entities/github-repository.entity';
import { CompanySettingsController } from './company-settings.controller';
import { CompanySettingsService } from './company-settings.service';
import { CompanyScopeService } from './company-scope.service';
import { CompanyProfile } from './entities/company-profile.entity';
import { CompanyMember } from './entities/company-member.entity';
import { CompanyInvite } from './entities/company-invite.entity';
import { CompanyBillingOrder } from './entities/company-billing-order.entity';
import { CompanyApiKey } from './entities/company-api-key.entity';
import { CompanyAuditLog } from './entities/company-audit-log.entity';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    TypeOrmModule.forFeature([
      User,
      Placement,
      HiringAssessment,
      Application,
      GithubRepository,
      CompanyProfile,
      CompanyMember,
      CompanyInvite,
      CompanyBillingOrder,
      CompanyApiKey,
      CompanyAuditLog,
    ]),
  ],
  controllers: [CompanySettingsController],
  providers: [CompanySettingsService, CompanyScopeService],
  exports: [CompanySettingsService, CompanyScopeService, TypeOrmModule],
})
export class CompanySettingsModule {}
