import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public, Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { MarketRadarService } from './market-radar.service';
import { PublishMarketRadarDto } from './dto/market-radar.dto';

@ApiTags('market-radar')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class MarketRadarController {
  constructor(private readonly marketRadarService: MarketRadarService) {}

  @Get('market-radar')
  @Public()
  @ApiOperation({ summary: 'Get latest market radar data' })
  async getLatest() {
    return this.marketRadarService.getLatest();
  }

  @Get('admin/market-radar')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get latest market radar data for admin' })
  async getLatestForAdmin() {
    return this.marketRadarService.getLatest();
  }

  @Put('admin/market-radar')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Publish market radar data' })
  async publish(@Request() req: any, @Body() payload: PublishMarketRadarDto) {
    return this.marketRadarService.publish(payload, req.user?.email || null);
  }
}
