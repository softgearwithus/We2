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
import { PerformanceService } from './performance.service';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('performance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Create a performance evaluation (Admin/AI only)' })
  @ApiResponse({ status: 201, description: 'Evaluation recorded' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async create(@Body() dto: CreatePerformanceDto) {
    return this.performanceService.create(dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my performance metrics' })
  @ApiResponse({
    status: 200,
    description: 'Aggregated performance metrics',
    schema: {
      example: {
        overall: 82.5,
        totalEvaluations: 12,
        byCategory: {
          technical: { average: 88, count: 4 },
          communication: { average: 76, count: 3 },
          collaboration: { average: 85, count: 3 },
          problem_solving: { average: 80, count: 2 },
        },
        recentScores: [],
      },
    },
  })
  async getMyMetrics(@Request() req: AuthenticatedRequest) {
    return this.performanceService.getMetrics(req.user.id);
  }

  @Get('me/history')
  @ApiOperation({ summary: 'Get my full performance history' })
  @ApiResponse({ status: 200, description: 'Performance records list' })
  async getMyHistory(@Request() req: AuthenticatedRequest) {
    return this.performanceService.findByUser(req.user.id);
  }

  @Get('simulation/:simulationId')
  @ApiOperation({ summary: 'Get performance for a specific simulation' })
  @ApiParam({ name: 'simulationId', description: 'Simulation UUID' })
  @ApiResponse({ status: 200, description: 'Simulation performance records' })
  async getBySimulation(
    @Param('simulationId') simulationId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.performanceService.findBySimulation(simulationId, req.user.id);
  }

  @Get('user/:userId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Get performance for a specific user (Admin only)' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User performance metrics' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getUserMetrics(@Param('userId') userId: string) {
    return this.performanceService.getMetrics(userId);
  }
}
