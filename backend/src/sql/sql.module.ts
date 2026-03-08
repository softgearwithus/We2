import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SqlController } from './sql.controller';
import { SqlTrainingController } from './sql-training.controller';
import { SqlService } from './sql.service';
import { SqlProblem } from './entities/sql-problem.entity';
import { SqlSubmission } from './entities/sql-submission.entity';
import { SqlUserState } from './entities/sql-user-state.entity';
import { SqlTrainingSession } from './entities/sql-training-session.entity';
import { SqlProblemInsight } from './entities/sql-problem-insight.entity';
import { LeetCodeService } from '../dsa/services/leetcode.service';
import { HackerRankService } from '../dsa/services/hackerrank.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SqlProblem,
            SqlSubmission,
            SqlUserState,
            SqlTrainingSession,
            SqlProblemInsight,
        ]),
    ],
    controllers: [SqlController, SqlTrainingController],
    providers: [SqlService, LeetCodeService, HackerRankService],
    exports: [SqlService],
})
export class SqlModule { }
