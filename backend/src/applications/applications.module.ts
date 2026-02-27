import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './entities/application.entity';
import { Placement } from '../placements/entities/placement.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Application, Placement])],
    controllers: [ApplicationsController],
    providers: [ApplicationsService],
})
export class ApplicationsModule { }
