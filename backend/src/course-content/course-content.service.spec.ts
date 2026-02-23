import { Test, TestingModule } from '@nestjs/testing';
import { CourseContentService } from './course-content.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseContent } from './entities/course-content.entity';

describe('CourseContentService', () => {
  let service: CourseContentService;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseContentService,
        {
          provide: getRepositoryToken(CourseContent),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CourseContentService>(CourseContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
