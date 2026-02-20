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
    @Post('chat')
    async chat(@Body() body: { message: string, history?: any[] }) {
        try {
            // Check for simple service injection first (some older setups)
            // If the service has the method, use it.
            // Note: We need to cast or ensure the service has the method if it was just added.
            if ('chatWithContext' in this.aiService) {
                return { response: await (this.aiService as any).chatWithContext(body.message, body.history) };
            }

            // Fallback: If AiService doesn't have it, we might need to modify AiService to delegate to GeminiService
            // But wait, GeminiService is likely injected into AiService. 
            // Let's check AiService to see if it exposes GeminiService or if we should add a method there.

            // Actually, best practice is to add a method to AiService that calls GeminiService.
            // Let's assume we will update AiService next.
            return this.aiService.chat(body.message, body.history || []);
        } catch (e) {
            return { response: "I'm refining my algorithms. Give me a second." };
        }
    }
}
