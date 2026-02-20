import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StudentProfile } from './student-profile.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';

describe('StudentsService', () => {
  it('should compile the module', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getRepositoryToken(StudentProfile), useValue: {} },
        { provide: UsersService, useValue: {} },
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
  });

  it('rejects non-admin roles', async () => {
    const profilesRepository = { findOne: jest.fn().mockResolvedValue(null) };
    const usersService = {
      findById: jest
        .fn()
        .mockResolvedValue({ role: UserRole.STUDENT, collegeId: 'college-1' }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getRepositoryToken(StudentProfile), useValue: profilesRepository },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    const service = moduleRef.get(StudentsService);

    await expect(
      service.getProfile('user-1', UserRole.STUDENT, 'college-1'),
    ).rejects.toThrow(ForbiddenException);
  });
});
