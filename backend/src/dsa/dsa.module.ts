import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DsaController } from './dsa.controller';
import { DsaTrainingController } from './dsa-training.controller';
import { DsaService } from './dsa.service';
import { DsaProblem } from './entities/dsa-problem.entity';
import { Submission } from './entities/submission.entity';
import { DsaUserState } from './entities/dsa-user-state.entity';
import { DsaTrainingSession } from './entities/dsa-training-session.entity';
import { DsaProblemInsight } from './entities/dsa-problem-insight.entity';
import { SubmissionQueueService } from '../queue/submission-queue.service';
import { LeetCodeService } from './services/leetcode.service';

@Module({
    imports: [TypeOrmModule.forFeature([DsaProblem, Submission, DsaUserState, DsaTrainingSession, DsaProblemInsight])],
    controllers: [DsaController, DsaTrainingController],
    providers: [DsaService, SubmissionQueueService, LeetCodeService],
    exports: [DsaService, SubmissionQueueService],
})
export class DsaModule { }
