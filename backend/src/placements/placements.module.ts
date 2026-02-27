import { Module } from '@nestjs/common';
import { PlacementsService } from './placements.service';
import { PlacementsController } from './placements.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Placement } from './entities/placement.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Placement, User])],
  controllers: [PlacementsController],
  providers: [PlacementsService],
})
export class PlacementsModule { }
