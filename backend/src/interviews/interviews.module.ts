import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewsService } from './interviews.service';
import { InterviewsController } from './interviews.controller';
import { InterviewSession } from './entities/interview-session.entity';

@Module({
    imports: [TypeOrmModule.forFeature([InterviewSession])],
    controllers: [InterviewsController],
    providers: [InterviewsService],
    exports: [InterviewsService],
})
export class InterviewsModule { }
