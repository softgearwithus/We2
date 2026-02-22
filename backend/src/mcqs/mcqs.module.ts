import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { McqQuestion } from './entities/mcq-question.entity';
import { AdminModule } from '../admin/admin.module';
import { McqsController } from './mcqs.controller';
import { McqsService } from './mcqs.service';

@Module({
    imports: [TypeOrmModule.forFeature([McqQuestion]), AdminModule],
    controllers: [McqsController],
    providers: [McqsService],
})
export class McqsModule { }
