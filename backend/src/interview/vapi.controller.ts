import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { InterviewService } from './interview.service';

@Controller('interview/vapi')
export class VapiController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleVapiWebhook(@Body() payload: any) {
    // console.log('Vapi Webhook:', JSON.stringify(payload, null, 2));

    // 1. Initial Handshake / Setup
    if (payload.message && payload.message.type === 'assistant-request') {
      // Use the assistant configured in Vapi; no override for Vapi-only flow.
      return { status: 'ok' };
    }

    if (payload.message && payload.message.type === 'call-started') {
      const callId = payload.message.call?.id;
      const userId = payload.message.call?.metadata?.userId;
      const assistantId = payload.message.call?.assistantId;
      const interviewSessionId = payload.message.call?.metadata?.interviewSessionId;
      if (callId && userId) {
        await this.interviewService.linkVapiCallToSession(userId, callId, {
          assistantId,
          interviewSessionId,
        });
      }
      return { status: 'ok' };
    }

    // 2. End of Call Handshake
    if (payload.message && payload.message.type === 'call-ended') {
      const callId = payload.message.call.id;
      // Trigger background fetching of report (~5 mins)
      this.interviewService.scheduleAnalysisReport(callId);
      // Also attempt immediate fetch so UI doesn't wait on the timer.
      this.interviewService.fetchVapiAnalysisNow(callId).catch((err) => {
        console.warn('Immediate Vapi analysis fetch failed', err);
      });
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
              role: 'assistant',
              content: "I didn't catch that. Could you repeat?",
            },
          },
        ],
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
            role: 'assistant',
            content: responseText,
          },
        },
      ],
    };
  }
}
