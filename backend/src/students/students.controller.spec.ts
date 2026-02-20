import { Test } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

describe('StudentsController', () => {
  it('should compile the module', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [{ provide: StudentsService, useValue: {} }],
    }).compile();

    expect(moduleRef).toBeDefined();
  });
});
