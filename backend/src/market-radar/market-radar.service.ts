import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketRadar } from './entities/market-radar.entity';
import { PublishMarketRadarDto } from './dto/market-radar.dto';

@Injectable()
export class MarketRadarService {
    constructor(
        @InjectRepository(MarketRadar)
        private marketRepo: Repository<MarketRadar>,
    ) {}

    async getLatest() {
        const records = await this.marketRepo.find({
            order: { publishedAt: 'DESC', updatedAt: 'DESC' },
            take: 1,
        });
        const record = records[0];
        if (!record) throw new NotFoundException('Market radar data not found');
        return record;
    }

    async publish(payload: PublishMarketRadarDto, publishedBy: string | null) {
        const record = this.marketRepo.create({
            payload: payload.payload,
            publishedBy,
            publishedAt: new Date(),
        });
        return this.marketRepo.save(record);
    }
}
