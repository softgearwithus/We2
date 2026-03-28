import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CertificationsService } from './certifications.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Public } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('certifications')
@Controller('certifications')
export class CertificationsController {
  constructor(private readonly certsService: CertificationsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Issue a certification (Admin only)' })
  @ApiResponse({ status: 201, description: 'Certification issued' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async create(@Body() dto: CreateCertificationDto) {
    return this.certsService.create(dto);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my certifications' })
  @ApiResponse({ status: 200, description: 'List of certifications' })
  async getMyCerts(@Request() req: AuthenticatedRequest) {
    return this.certsService.findByUser(req.user.id);
  }

  @Get('verify')
  @Public()
  @ApiOperation({ summary: 'Verify a certification by code (Public)' })
  @ApiQuery({ name: 'code', example: 'A1B2C3D4E5F6G7H8' })
  @ApiResponse({ status: 200, description: 'Certification details' })
  @ApiResponse({ status: 404, description: 'Invalid verification code' })
  async verify(@Query('code') code: string) {
    return this.certsService.verify(code);
  }

  @Get('admin/all')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Get all certifications (Admin only)' })
  @ApiResponse({ status: 200, description: 'All certifications' })
  async findAll() {
    return this.certsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get certification by ID' })
  @ApiParam({ name: 'id', description: 'Certification UUID' })
  @ApiResponse({ status: 200, description: 'Certification details' })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  async findOne(@Param('id') id: string) {
    return this.certsService.findOne(id);
  }
}
