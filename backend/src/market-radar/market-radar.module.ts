import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketRadar } from './entities/market-radar.entity';
import { MarketRadarController } from './market-radar.controller';
import { MarketRadarService } from './market-radar.service';

@Module({
  imports: [TypeOrmModule.forFeature([MarketRadar])],
  controllers: [MarketRadarController],
  providers: [MarketRadarService],
})
export class MarketRadarModule {}
