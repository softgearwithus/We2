import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyLeadsController } from './company-leads.controller';
import { CompanyLeadsService } from './company-leads.service';
import { CompanyLead } from './entities/company-lead.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyLead])],
  controllers: [CompanyLeadsController],
  providers: [CompanyLeadsService],
  exports: [CompanyLeadsService],
})
export class CompanyLeadsModule {}
