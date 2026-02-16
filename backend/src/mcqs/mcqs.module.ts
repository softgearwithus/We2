import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { McqQuestion } from './entities/mcq-question.entity';
import { McqsController } from './mcqs.controller';
import { McqsService } from './mcqs.service';

@Module({
    imports: [TypeOrmModule.forFeature([McqQuestion])],
    controllers: [McqsController],
    providers: [McqsService],
})
export class McqsModule { }
