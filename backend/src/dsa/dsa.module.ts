import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DsaController } from './dsa.controller';
import { DsaService } from './dsa.service';
import { DsaProblem } from './entities/dsa-problem.entity';
import { Submission } from './entities/submission.entity';
import { SubmissionQueueService } from '../queue/submission-queue.service';

@Module({
    imports: [TypeOrmModule.forFeature([DsaProblem, Submission])],
    controllers: [DsaController],
    providers: [DsaService, SubmissionQueueService],
    exports: [DsaService, SubmissionQueueService],
})
export class DsaModule { }
