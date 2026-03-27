import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CareersService } from './careers.service';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('careers')
@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new career (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'The career has been successfully created.',
  })
  create(@Body() createCareerDto: CreateCareerDto) {
    return this.careersService.create(createCareerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all careers' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Return all matching careers.' })
  findAll(@Query('activeOnly') activeOnly?: string) {
    const isActiveOnly = activeOnly === 'true';
    return this.careersService.findAll(isActiveOnly);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a career by ID' })
  @ApiResponse({ status: 200, description: 'Return the exact career details.' })
  findOne(@Param('id') id: string) {
    return this.careersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a career (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'The career has been successfully updated.',
  })
  update(@Param('id') id: string, @Body() updateCareerDto: UpdateCareerDto) {
    return this.careersService.update(id, updateCareerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a career (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'The career has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.careersService.remove(id);
  }
}
