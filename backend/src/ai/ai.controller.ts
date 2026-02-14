import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

class GenerateContentDto {
    topicId: string;
    topicTitle: string;
}

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('generate-content')
    async generateContent(@Body() dto: GenerateContentDto) {
        try {
            const content = await this.aiService.generateContent(dto.topicId, dto.topicTitle);
            return { content };
        } catch (e) {
            return { content: `❌ **Backend Controller Error**: ${e.message}` };
        }
    }
}
