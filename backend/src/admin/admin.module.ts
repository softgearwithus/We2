import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { College } from '../colleges/entities/college.entity';
import { CollegeStaff } from '../colleges/entities/college-staff.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AdminActivityLog, College, CollegeStaff])],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule {}
