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
import { InterviewsModule } from '../interviews/interviews.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is required');
        }

        return {
          secret,
          signOptions: {
            expiresIn: '90s' as StringValue,
          },
        };
      },
      inject: [ConfigService],
    }),
    AdminSettingsModule,
    InterviewsModule,
    UsersModule,
  ],
  controllers: [AiInterviewerController],
  providers: [AiInterviewerService],
  exports: [AiInterviewerService],
})
export class AiInterviewerModule {}
