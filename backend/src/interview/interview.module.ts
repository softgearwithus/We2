import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { VapiController } from './vapi.controller';
import { Interview } from './entities/interview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Interview])],
  controllers: [InterviewController, VapiController],
  providers: [InterviewService],
})
export class InterviewModule { }
