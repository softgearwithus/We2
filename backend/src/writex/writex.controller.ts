import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { CreateWriteXQuestionDto } from './dto/create-writex-question.dto';
import { SubmitWriteXDto } from './dto/submit-writex.dto';
import { UpdateWriteXQuestionDto } from './dto/update-writex-question.dto';
import { WriteXService } from './writex.service';

@ApiTags('writex')
@Controller('writex')
export class WriteXController {
  constructor(private readonly writexService: WriteXService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('question')
  @ApiOperation({ summary: 'Get active WriteX question' })
  @ApiResponse({ status: 200, description: 'Active question' })
  async getQuestion(@Query('topicKey') topicKey?: string) {
    return this.writexService.getActiveQuestion(topicKey);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('groups')
  @ApiOperation({ summary: 'List WriteX topic groups' })
  @ApiResponse({ status: 200, description: 'Groups list' })
  async getGroups() {
    return this.writexService.getGroups();
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('submit')
  @ApiOperation({ summary: 'Submit WriteX answer for evaluation' })
  @ApiResponse({ status: 200, description: 'Evaluation result' })
  async submit(@Body() dto: SubmitWriteXDto) {
    return this.writexService.evaluateAnswer(dto.questionId, dto.answer);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('questions')
  @ApiOperation({ summary: 'Create WriteX question (Admin only)' })
  @ApiResponse({ status: 201, description: 'Question created' })
  async create(@Body() dto: CreateWriteXQuestionDto) {
    return this.writexService.createQuestion(
      dto.prompt,
      dto.active ?? true,
      dto.topicKey,
      dto.topicLabel,
    );
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('questions')
  @ApiOperation({ summary: 'List WriteX questions (Admin only)' })
  @ApiResponse({ status: 200, description: 'Questions list' })
  async list(@Query('topicKey') topicKey?: string) {
    return this.writexService.listQuestions(topicKey);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('questions/:id')
  @ApiOperation({ summary: 'Update WriteX question (Admin only)' })
  @ApiResponse({ status: 200, description: 'Question updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateWriteXQuestionDto) {
    return this.writexService.updateQuestion(id, dto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete('questions/:id')
  @ApiOperation({ summary: 'Delete WriteX question (Admin only)' })
  @ApiResponse({ status: 200, description: 'Question deleted' })
  async remove(@Param('id') id: string) {
    return this.writexService.deleteQuestion(id);
  }
}
