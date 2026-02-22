import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { College } from '../colleges/entities/college.entity';
import { CollegeStaff } from '../colleges/entities/college-staff.entity';
import { User } from '../users/user.entity';
import { Submission } from '../dsa/entities/submission.entity';
import { SqlSubmission } from '../sql/entities/sql-submission.entity';
import { InterviewSession } from '../interviews/entities/interview-session.entity';
import { ProjectLabSubmission } from '../project-labs/entities/project-lab-submission.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AdminActivityLog,
            College,
            CollegeStaff,
            User,
            Submission,
            SqlSubmission,
            InterviewSession,
            ProjectLabSubmission,
        ]),
    ],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule {}
