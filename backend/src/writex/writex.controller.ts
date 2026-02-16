import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { CreateWriteXQuestionDto } from './dto/create-writex-question.dto';
import { SubmitWriteXDto } from './dto/submit-writex.dto';
import { WriteXService } from './writex.service';

@ApiTags('writex')
@Controller('writex')
export class WriteXController {
    constructor(private readonly writexService: WriteXService) { }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('question')
    @ApiOperation({ summary: 'Get active WriteX question' })
    @ApiResponse({ status: 200, description: 'Active question' })
    async getQuestion() {
        return this.writexService.getActiveQuestion();
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
        return this.writexService.createQuestion(dto.prompt, dto.active ?? true);
    }
}
