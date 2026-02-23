import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { ConfigModule } from '@nestjs/config';
import { Resume } from './entities/resume.entity';
import { AdminSettingsModule } from '../admin-settings/admin-settings.module';

@Module({
    imports: [ConfigModule, TypeOrmModule.forFeature([Resume]), AdminSettingsModule],
    controllers: [ResumeController],
    providers: [ResumeService],
})
export class ResumeModule { }
