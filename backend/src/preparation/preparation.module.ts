import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreparationController } from './preparation.controller';
import { PreparationService } from './preparation.service';
import { PreparationProgress } from './entities/preparation-progress.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PreparationProgress])],
    controllers: [PreparationController],
    providers: [PreparationService],
})
export class PreparationModule { }
