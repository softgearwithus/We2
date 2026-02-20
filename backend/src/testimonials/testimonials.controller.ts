import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Public } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('testimonials')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('testimonials')
export class TestimonialsController {
    constructor(private readonly testimonialsService: TestimonialsService) {}

    @Get('active')
    @Public()
    @ApiOperation({ summary: 'List active testimonials (public)' })
    @ApiResponse({ status: 200, description: 'Active testimonials' })
    findActive() {
        return this.testimonialsService.findActive();
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'List all testimonials (admin)' })
    findAll() {
        return this.testimonialsService.findAll();
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create testimonial (admin)' })
    create(@Body() body: CreateTestimonialDto) {
        return this.testimonialsService.create(body);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update testimonial (admin)' })
    update(@Param('id') id: string, @Body() body: UpdateTestimonialDto) {
        return this.testimonialsService.update(id, body);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete testimonial (admin)' })
    remove(@Param('id') id: string) {
        return this.testimonialsService.remove(id);
    }
}
