import { Test, TestingModule } from '@nestjs/testing';
import { TestSeriesController } from './test-series.controller';

describe('TestSeriesController', () => {
  let controller: TestSeriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestSeriesController],
    }).compile();

    controller = module.get<TestSeriesController>(TestSeriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
