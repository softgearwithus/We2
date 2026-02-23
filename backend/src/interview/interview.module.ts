import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { VapiController } from './vapi.controller';
import { Interview } from './entities/interview.entity';
import { InterviewSession } from '../interviews/entities/interview-session.entity';
import { AdminSettingsModule } from '../admin-settings/admin-settings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Interview, InterviewSession]), AdminSettingsModule],
  controllers: [InterviewController, VapiController],
  providers: [InterviewService],
})
export class InterviewModule { }
