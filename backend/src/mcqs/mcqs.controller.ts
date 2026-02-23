import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { CreateMcqQuestionDto } from './dto/create-mcq-question.dto';
import { ImportMcqsDto } from './dto/import-mcqs.dto';
import { ListMcqQueryDto } from './dto/list-mcq-query.dto';
import { AdminMcqQueryDto } from './dto/admin-mcq-query.dto';
import { UpdateMcqQuestionDto } from './dto/update-mcq-question.dto';
import { McqsService } from './mcqs.service';
import { RequireSectionUsage } from '../usage/guards/usage.guard';
import { USAGE_SECTION_KEYS } from '../usage/usage.constants';
import { ExecutionContext } from '@nestjs/common';
import { McqCategory } from './entities/mcq-question.entity';
import { McqApiKeyGuard } from './guards/mcq-api-key.guard';
import { AdminDeleteMcqQueryDto } from './dto/admin-delete-mcq-query.dto';

@ApiTags('mcqs')
@Controller('mcqs')
export class McqsController {
    constructor(private readonly mcqsService: McqsService) { }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('groups')
    @ApiOperation({ summary: 'List available MCQ groups with counts' })
    @ApiResponse({ status: 200, description: 'Groups list' })
    @RequireSectionUsage((context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        const category = request?.query?.category;
        return category === 'company'
            ? USAGE_SECTION_KEYS.TEST_SERIES_COMPANY
            : USAGE_SECTION_KEYS.TEST_SERIES_SUBJECT;
    })
    async groups(@Query('category') category: McqCategory) {
        return this.mcqsService.groups(category);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiOperation({ summary: 'List MCQ questions by subject (paginated)' })
    @ApiResponse({ status: 200, description: 'Paginated MCQs' })
    @RequireSectionUsage((context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        const category = request?.query?.category;
        return category === 'company'
            ? USAGE_SECTION_KEYS.TEST_SERIES_COMPANY
            : USAGE_SECTION_KEYS.TEST_SERIES_SUBJECT;
    })
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

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Get('admin')
    @ApiOperation({ summary: 'Admin list MCQs (paginated)' })
    @ApiResponse({ status: 200, description: 'Admin MCQ list' })
    async adminList(@Query() query: AdminMcqQueryDto) {
        return this.mcqsService.adminList(query);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Patch(':id')
    @ApiOperation({ summary: 'Update MCQ question (Admin only)' })
    @ApiResponse({ status: 200, description: 'MCQ updated' })
    async update(@Param('id') id: string, @Body() dto: UpdateMcqQuestionDto) {
        return this.mcqsService.update(id, dto);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete MCQ question (Admin only)' })
    @ApiResponse({ status: 200, description: 'MCQ deleted' })
    async remove(@Param('id') id: string) {
        return this.mcqsService.remove(id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Delete('admin')
    @ApiOperation({ summary: 'Bulk delete MCQs (Admin only)' })
    @ApiResponse({ status: 200, description: 'MCQs deleted' })
    async bulkRemove(@Query() query: AdminDeleteMcqQueryDto) {
        return this.mcqsService.bulkRemove(query);
    }

    @UseGuards(McqApiKeyGuard)
    @Post('import')
    @ApiOperation({ summary: 'Import MCQs from CSV (API key)' })
    @ApiResponse({ status: 200, description: 'MCQs imported' })
    async importCsv(@Body() dto: ImportMcqsDto) {
        return this.mcqsService.importFromCsv(dto.csv);
    }
}
