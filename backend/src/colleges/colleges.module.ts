import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollegesController } from './colleges.controller';
import { CollegesService } from './colleges.service';
import { College } from './entities/college.entity';
import { CollegeStaff } from './entities/college-staff.entity';
import { StudentCohort } from './entities/student-cohort.entity';
import { CollegeStudent } from './entities/college-student.entity';
import { AdminActivityLog } from '../admin/entities/admin-activity-log.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([College, CollegeStaff, StudentCohort, CollegeStudent, AdminActivityLog, User]), UsersModule],
    controllers: [CollegesController],
    providers: [CollegesService],
    exports: [CollegesService],
})
export class CollegesModule {}
