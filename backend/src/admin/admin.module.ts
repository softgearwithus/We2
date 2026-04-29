import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { College } from '../colleges/entities/college.entity';
import { CollegeStaff } from '../colleges/entities/college-staff.entity';
import { User } from '../users/user.entity';
import { InterviewSession } from '../interviews/entities/interview-session.entity';
import { Placement } from '../placements/entities/placement.entity';
import { Application } from '../applications/entities/application.entity';
import { PendingUpgradeOrder } from '../users/entities/pending-upgrade-order.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      AdminActivityLog,
      College,
      CollegeStaff,
      User,
      InterviewSession,
      Placement,
      Application,
      PendingUpgradeOrder,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
