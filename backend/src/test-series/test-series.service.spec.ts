import { Test, TestingModule } from '@nestjs/testing';
import { TestSeriesService } from './test-series.service';

describe('TestSeriesService', () => {
  let service: TestSeriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestSeriesService],
    }).compile();

    service = module.get<TestSeriesService>(TestSeriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
