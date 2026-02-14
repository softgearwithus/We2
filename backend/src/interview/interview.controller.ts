import { Controller, Post, Body, Param, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('analyze-audio')
  @UseInterceptors(FileInterceptor('audio'))
  async analyzeAudio(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          // new FileTypeValidator({ fileType: 'audio/*' }), // Broad audio check
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: any,
  ) {
    const type = body.type;
    const referenceText = body.referenceText;

    return {
      feedback: await this.interviewService.analyzeAudio(file.buffer, file.mimetype, type, referenceText),
    };
  }

  @Post(':id/end')
  endSession(@Param('id') id: string) {
    return this.interviewService.endSession(id);
  }
}
