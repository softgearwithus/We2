import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { CreateMcqQuestionDto } from './dto/create-mcq-question.dto';
import { ImportMcqsDto } from './dto/import-mcqs.dto';
import { ListMcqQueryDto } from './dto/list-mcq-query.dto';
import { McqsService } from './mcqs.service';
import { McqCategory } from './entities/mcq-question.entity';
import { McqApiKeyGuard } from './guards/mcq-api-key.guard';

@ApiTags('mcqs')
@Controller('mcqs')
export class McqsController {
    constructor(private readonly mcqsService: McqsService) { }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('groups')
    @ApiOperation({ summary: 'List available MCQ groups with counts' })
    @ApiResponse({ status: 200, description: 'Groups list' })
    async groups(@Query('category') category: McqCategory) {
        return this.mcqsService.groups(category);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiOperation({ summary: 'List MCQ questions by subject (paginated)' })
    @ApiResponse({ status: 200, description: 'Paginated MCQs' })
    async list(@Query() query: ListMcqQueryDto) {
        return this.mcqsService.list(query);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Post()
    @ApiOperation({ summary: 'Create MCQ question (Admin only)' })
    @ApiResponse({ status: 201, description: 'MCQ created' })
    async create(@Body() dto: CreateMcqQuestionDto) {
        return this.mcqsService.create(dto);
    }

    @UseGuards(McqApiKeyGuard)
    @Post('import')
    @ApiOperation({ summary: 'Import MCQs from CSV (API key)' })
    @ApiResponse({ status: 200, description: 'MCQs imported' })
    async importCsv(@Body() dto: ImportMcqsDto) {
        return this.mcqsService.importFromCsv(dto.csv);
    }
}
