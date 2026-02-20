import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiService } from '../common/gemini.service';
import { PlatformKnowledgeService } from './platform-knowledge.service';

@Module({
    imports: [ConfigModule],
    controllers: [AiController],
    providers: [AiService, GeminiService, PlatformKnowledgeService],
    exports: [AiService],
})
export class AiModule { }
