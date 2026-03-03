import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiInterviewerController } from './ai-interviewer.controller';
import { AiInterviewerService } from './ai-interviewer.service';
import { AiInterviewSession } from './entities/ai-interview-session.entity';
import { AiInterviewReport } from './entities/ai-interview-report.entity';
import { AiInterviewModerationEvent } from './entities/ai-interview-moderation-event.entity';
import { ResumeDocument } from './entities/resume-document.entity';
import { InterviewSession } from '../interviews/entities/interview-session.entity';
import { ConfigModule } from '@nestjs/config';
import { AdminSettingsModule } from '../admin-settings/admin-settings.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AiInterviewSession,
            AiInterviewReport,
            AiInterviewModerationEvent,
            ResumeDocument,
            InterviewSession,
        ]),
        ConfigModule,
        AdminSettingsModule,
    ],
    controllers: [AiInterviewerController],
    providers: [AiInterviewerService],
    exports: [AiInterviewerService],
})
export class AiInterviewerModule { }
