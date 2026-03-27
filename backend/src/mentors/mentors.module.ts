import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentorsController } from './mentors.controller';
import { MentorsService } from './mentors.service';
import { MentorProfile } from './entities/mentor-profile.entity';
import { MentorApplication } from './entities/mentor-application.entity';
import { MentorSession } from './entities/mentor-session.entity';
import { MentorPayout } from './entities/mentor-payout.entity';
import { MentorPaymentOrder } from './entities/mentor-payment-order.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MentorProfile,
      MentorApplication,
      MentorSession,
      MentorPayout,
      MentorPaymentOrder,
    ]),
    UsersModule,
  ],
  controllers: [MentorsController],
  providers: [MentorsService],
})
export class MentorsModule {}
