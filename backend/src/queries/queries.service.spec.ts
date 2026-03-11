import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueriesService } from './queries.service';
import { Query } from './entities/query.entity';

describe('QueriesService', () => {
  let service: QueriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueriesService,
        {
          provide: getRepositoryToken(Query),
          useValue: {}
        }
      ],
    }).compile();

    service = module.get<QueriesService>(QueriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
