import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Submission } from '../dsa/entities/submission.entity';
import { SqlSubmission } from '../sql/entities/sql-submission.entity';
import { InterviewSession } from '../interviews/entities/interview-session.entity';
import { ProjectLabSubmission } from '../project-labs/entities/project-lab-submission.entity';
import { Resume } from '../resume/entities/resume.entity';
import { MentorSession } from '../mentors/entities/mentor-session.entity';
import { UserGamification } from '../gamification/entities/user-gamification.entity';
import { AdminSettingsModule } from '../admin-settings/admin-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Submission,
      SqlSubmission,
      InterviewSession,
      ProjectLabSubmission,
      Resume,
      MentorSession,
      UserGamification,
    ]),
    forwardRef(() => AdminSettingsModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule { }
