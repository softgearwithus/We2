import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TestSeriesService } from './test-series.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/test-series.dto';

@ApiTags('test-series')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('test-series')
export class TestSeriesController {
    constructor(private readonly testSeriesService: TestSeriesService) { }

    // --- Student Endpoints ---
    @Get('student/companies')
    @Roles(UserRole.STUDENT, UserRole.MENTOR, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'List active companies for students' })
    getStudentCompanies() {
        return this.testSeriesService.getCompanies(true);
    }

    @Get('student/companies/:id/hierarchy')
    @Roles(UserRole.STUDENT, UserRole.MENTOR, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get full mock tests hierarchy for a company' })
    getCompanyHierarchy(@Param('id') id: string) {
        return this.testSeriesService.getCompanyHierarchy(id);
    }

    @Get('student/mock-tests/:id')
    @Roles(UserRole.STUDENT, UserRole.MENTOR, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get the full test data for a mock test session' })
    getMockTestFull(@Param('id') id: string) {
        return this.testSeriesService.getMockTestFull(id);
    }

    // --- Admin Endpoints ---
    @Get('admin/companies')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'List all companies (Admin)' })
    getAdminCompanies() {
        return this.testSeriesService.getCompanies(false);
    }

    @Post('admin/companies')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create a company (Admin)' })
    createCompany(@Body() dto: CreateCompanyDto) {
        return this.testSeriesService.createCompany(dto);
    }

    @Patch('admin/companies/:id')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update a company (Admin)' })
    updateCompany(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
        return this.testSeriesService.updateCompany(id, dto);
    }

    @Delete('admin/companies/:id')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete a company (Admin)' })
    deleteCompany(@Param('id') id: string) {
        return this.testSeriesService.deleteCompany(id);
    }

    @Post('admin/mock-tests')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create a mock test' })
    createMockTest(@Body() dto: any) {
        return this.testSeriesService.createMockTest(dto);
    }

    @Patch('admin/mock-tests/:id')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update a mock test' })
    updateMockTest(@Param('id') id: string, @Body() dto: any) {
        return this.testSeriesService.updateMockTest(id, dto);
    }

    @Delete('admin/mock-tests/:id')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete a mock test' })
    deleteMockTest(@Param('id') id: string) {
        return this.testSeriesService.deleteMockTest(id);
    }

    @Post('admin/sections')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create a section' })
    createSection(@Body() dto: any) {
        return this.testSeriesService.createSection(dto);
    }

    @Patch('admin/sections/:id')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update a section' })
    updateSection(@Param('id') id: string, @Body() dto: any) {
        return this.testSeriesService.updateSection(id, dto);
    }

    @Delete('admin/sections/:id')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete a section' })
    deleteSection(@Param('id') id: string) {
        return this.testSeriesService.deleteSection(id);
    }

    @Post('admin/sections/:id/bulk-questions')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Instantly populate a section with a bulk JSON array of questions' })
    importBulkQuestions(@Param('id') id: string, @Body() dto: { questions: any[] }) {
        if (!dto.questions || !Array.isArray(dto.questions)) {
            throw new Error('Must provide a "questions" array in the body');
        }
        return this.testSeriesService.importBulkQuestions(id, dto.questions);
    }
}
