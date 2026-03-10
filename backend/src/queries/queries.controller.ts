import { Controller, Post, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { QueriesService } from './queries.service';
import { CreateQueryDto } from './dto/create-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@Controller('queries')
export class QueriesController {
    constructor(private readonly queriesService: QueriesService) { }

    @Post()
    async create(@Body() createQueryDto: CreateQueryDto) {
        return this.queriesService.create(createQueryDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN) // Restrict view to super admins only
    async findAll() {
        return this.queriesService.findAll();
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN) // Restrict view to super admins only
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: string
    ) {
        return this.queriesService.updateStatus(id, status);
    }
}
