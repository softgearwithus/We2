import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SimulationsService } from './simulations.service';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { UpdateSimulationDto } from './dto/update-simulation.dto';
import { SimulationResponseDto } from './dto/simulation-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('simulations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new simulation' })
  @ApiResponse({
    status: 201,
    description: 'Simulation created successfully',
    type: SimulationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - User already has an active simulation',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createSimulationDto: CreateSimulationDto,
  ) {
    return this.simulationsService.create(req.user.id, createSimulationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all simulations for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of simulations',
    type: [SimulationResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.simulationsService.findAllByUser(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get simulation statistics for current user' })
  @ApiResponse({
    status: 200,
    description: 'User simulation statistics',
    schema: {
      example: {
        total: 5,
        completed: 2,
        inProgress: 1,
        abandoned: 2,
        averageScore: 87.5,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(@Request() req: AuthenticatedRequest) {
    return this.simulationsService.getStats(req.user.id);
  }

  @Get('admin/all')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Get all simulations (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all simulations',
    type: [SimulationResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async findAllAdmin() {
    return this.simulationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a simulation by ID' })
  @ApiParam({ name: 'id', description: 'Simulation UUID' })
  @ApiResponse({
    status: 200,
    description: 'Simulation details',
    type: SimulationResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your simulation' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.simulationsService.findOne(id, req.user.id);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start a simulation (change status to IN_PROGRESS)',
  })
  @ApiParam({ name: 'id', description: 'Simulation UUID' })
  @ApiResponse({
    status: 200,
    description: 'Simulation started successfully',
    type: SimulationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Simulation already started',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async start(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.simulationsService.start(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a simulation' })
  @ApiParam({ name: 'id', description: 'Simulation UUID' })
  @ApiResponse({
    status: 200,
    description: 'Simulation updated successfully',
    type: SimulationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot update completed simulation',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async update(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() updateSimulationDto: UpdateSimulationDto,
  ) {
    return this.simulationsService.update(id, req.user.id, updateSimulationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Abandon a simulation (soft delete)' })
  @ApiParam({ name: 'id', description: 'Simulation UUID' })
  @ApiResponse({
    status: 204,
    description: 'Simulation abandoned successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.simulationsService.remove(id, req.user.id);
  }
}
