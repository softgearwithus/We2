import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewsService } from './interviews.service';
import { InterviewsController } from './interviews.controller';
import { InterviewSession } from './entities/interview-session.entity';
import { User } from '../users/user.entity';
import { GeminiService } from '../common/gemini.service';
import { AdminSettingsModule } from '../admin-settings/admin-settings.module';

@Module({
    imports: [TypeOrmModule.forFeature([InterviewSession, User]), AdminSettingsModule],
    controllers: [InterviewsController],
    providers: [InterviewsService, GeminiService],
    exports: [InterviewsService],
})
export class InterviewsModule { }
