import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { VapiPayloadDto } from './dto/vapi.dto';

@Controller('interview/vapi')
export class VapiController {
    constructor(private readonly interviewService: InterviewService) { }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async handleVapiWebhook(@Body() payload: any) {
        // console.log('Vapi Webhook:', JSON.stringify(payload, null, 2));

        // 1. Initial Handshake / Setup
        if (payload.message && payload.message.type === 'assistant-request') {
            // Vapi asking "What assistant should I use?" - We can return override config here if needed
            // For now, return nothing to use dashboard default, or basic config
            return {
                assistant: {
                    firstMessage: "Hello! I am your AI Interviewer. Shall we start with a brief introduction?",
                    model: {
                        provider: "custom-llm",
                        url: "https://<YOUR_NGROK_URL>/interview/vapi/chat", // This endpoint will be called for each turn
                        messages: [
                            {
                                role: "system",
                                content: "You are a professional technical interviewer. Keep responses concise (under 2 sentences). Start by asking the candidate to introduce themselves."
                            }
                        ]
                    },
                    voice: {
                        provider: "11labs",
                        voiceId: "burt"
                    }
                }
            };
        }

        return { status: 'ok' };
    }

    @Post('chat')
    @HttpCode(HttpStatus.OK)
    async handleVapiChat(@Body() payload: any) {
        // This is called by Vapi when "provider": "custom-llm" is selected
        // Payload contains the conversation history

        // Extract latest user message
        const messages = payload.messages;
        // Vapi sends [ { role: 'user', content: '...' }, ... ]

        if (!messages || messages.length === 0) {
            return {
                choices: [
                    {
                        index: 0,
                        message: {
                            role: "assistant",
                            content: "I didn't catch that. Could you repeat?"
                        }
                    }
                ]
            };
        }

        // Call Gemini logic
        const responseText = await this.interviewService.handleVapiChat(messages);

        // Return in OpenAI-compatible format (Vapi expects this for 'custom-llm')
        return {
            choices: [
                {
                    index: 0,
                    message: {
                        role: "assistant",
                        content: responseText
                    }
                }
            ]
        };
    }
}
