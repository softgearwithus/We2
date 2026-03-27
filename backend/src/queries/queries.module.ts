import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueriesController } from './queries.controller';
import { QueriesService } from './queries.service';
import { Query } from './entities/query.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Query])],
  controllers: [QueriesController],
  providers: [QueriesService],
})
export class QueriesModule {}
