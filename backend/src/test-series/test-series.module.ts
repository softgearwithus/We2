import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestSeriesService } from './test-series.service';
import { TestSeriesController } from './test-series.controller';
import { TestEvaluationService } from './test-evaluation.service';
import { Company } from './entities/company.entity';
import { MockTest } from './entities/mock-test.entity';
import { MockTestSection } from './entities/mock-test-section.entity';
import { MockTestQuestion } from './entities/mock-test-question.entity';
import { MockTestResult } from './entities/mock-test-result.entity';
import { MockTestStudentResponse } from './entities/mock-test-student-response.entity';
import { McqQuestion } from '../mcqs/entities/mcq-question.entity';
import { WriteXQuestion } from '../writex/entities/writex-question.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      MockTest,
      MockTestSection,
      MockTestQuestion,
      MockTestResult,
      MockTestStudentResponse,
      User,
      McqQuestion,
      WriteXQuestion,
    ]),
  ],
  controllers: [TestSeriesController],
  providers: [TestSeriesService, TestEvaluationService],
  exports: [TestSeriesService],
})
export class TestSeriesModule {}
