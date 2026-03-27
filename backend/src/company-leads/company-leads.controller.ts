import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { CompanyLeadsService } from './company-leads.service';
import { CreateCompanyLeadDto } from './dto/create-company-lead.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public, Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@Controller('company-leads')
export class CompanyLeadsController {
  constructor(private readonly leadsService: CompanyLeadsService) {}

  @Public()
  @Post()
  async create(@Body() createDto: CreateCompanyLeadDto) {
    return this.leadsService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  async findAll() {
    return this.leadsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post(':id/status') // Changed to Post or Patch since imports only have Post/Get
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.leadsService.updateStatus(id, status);
  }
}
