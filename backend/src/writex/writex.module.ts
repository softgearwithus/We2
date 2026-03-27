import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from '../admin/admin.module';
import { WriteXQuestion } from './entities/writex-question.entity';
import { WriteXController } from './writex.controller';
import { WriteXService } from './writex.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WriteXQuestion]),
    ConfigModule,
    AdminModule,
  ],
  controllers: [WriteXController],
  providers: [WriteXService],
})
export class WriteXModule {}
