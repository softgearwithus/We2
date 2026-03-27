import { Test, TestingModule } from '@nestjs/testing';
import { TestSeriesController } from './test-series.controller';
import { TestSeriesService } from './test-series.service';

describe('TestSeriesController', () => {
  let controller: TestSeriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestSeriesController],
      providers: [
        {
          provide: TestSeriesService,
          useValue: {
            getCompanies: jest.fn(),
            getCompanyHierarchy: jest.fn(),
            getMockTestFull: jest.fn(),
            submitTest: jest.fn(),
            submitSubjectPractice: jest.fn(),
            getResultFull: jest.fn(),
            getStudentResults: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TestSeriesController>(TestSeriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
