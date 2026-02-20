import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Submission } from '../dsa/entities/submission.entity';
import { UserGamification } from '../gamification/entities/user-gamification.entity';
import { GamificationModule } from '../gamification/gamification.module';
import { DsaProblem } from '../dsa/entities/dsa-problem.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Submission, UserGamification, DsaProblem]),
        GamificationModule
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule { }
