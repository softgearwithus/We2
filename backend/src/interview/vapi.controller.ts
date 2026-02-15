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
                        url: `${process.env.BASE_URL || 'https://<YOUR_NGROK_URL>'}/interview/vapi/chat`, // Use env for ngrok
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

        // 2. End of Call Handshake
        if (payload.message && payload.message.type === 'call-ended') {
            const callId = payload.message.call.id;
            // Trigger background fetching of report (~5 mins)
            this.interviewService.scheduleAnalysisReport(callId);
            return { status: 'processing' };
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
