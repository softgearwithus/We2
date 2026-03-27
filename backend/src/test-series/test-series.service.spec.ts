import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TestSeriesService } from './test-series.service';
import { Company } from './entities/company.entity';
import { MockTest } from './entities/mock-test.entity';
import { MockTestSection } from './entities/mock-test-section.entity';
import { MockTestQuestion } from './entities/mock-test-question.entity';
import { MockTestResult } from './entities/mock-test-result.entity';
import { MockTestStudentResponse } from './entities/mock-test-student-response.entity';
import { User } from '../users/user.entity';
import { McqQuestion } from '../mcqs/entities/mcq-question.entity';
import { TestEvaluationService } from './test-evaluation.service';

describe('TestSeriesService', () => {
  let service: TestSeriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestSeriesService,
        {
          provide: getRepositoryToken(Company),
          useValue: {},
        },
        {
          provide: getRepositoryToken(MockTest),
          useValue: {},
        },
        {
          provide: getRepositoryToken(MockTestSection),
          useValue: {},
        },
        {
          provide: getRepositoryToken(MockTestQuestion),
          useValue: {},
        },
        {
          provide: getRepositoryToken(MockTestResult),
          useValue: {},
        },
        {
          provide: getRepositoryToken(MockTestStudentResponse),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: getRepositoryToken(McqQuestion),
          useValue: {},
        },
        {
          provide: TestEvaluationService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TestSeriesService>(TestSeriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
