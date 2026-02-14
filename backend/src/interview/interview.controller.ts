import { Controller, Post, Body, Param } from '@nestjs/common';
import { InterviewService } from './interview.service';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) { }

  @Post('start')
  startSession(@Body('userId') userId: string) {
    return this.interviewService.startSession(userId || 'guest'); // Allow guest for now
  }

  @Post(':id/message')
  sendMessage(@Param('id') id: string, @Body('message') message: string) {
    return this.interviewService.processMessage(id, message);
  }

  @Post(':id/end')
  endSession(@Param('id') id: string) {
    return this.interviewService.endSession(id);
  }
}
