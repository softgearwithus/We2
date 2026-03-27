import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { InterviewSession } from '../interviews/entities/interview-session.entity';
import { UserGamification } from '../gamification/entities/user-gamification.entity';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InterviewSession, UserGamification]),
    GamificationModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
