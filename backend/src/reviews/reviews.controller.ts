import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('reviews')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Get('published')
    @ApiOperation({ summary: 'List published reviews' })
    @ApiResponse({ status: 200, description: 'Published reviews' })
    findPublished() {
        return this.reviewsService.findPublished();
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'List all reviews (admin)' })
    findAll() {
        return this.reviewsService.findAll();
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create review (admin)' })
    create(@Request() req: any, @Body() body: CreateReviewDto) {
        return this.reviewsService.create(body, req.user?.id);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update review (admin)' })
    update(@Param('id') id: string, @Body() body: UpdateReviewDto) {
        return this.reviewsService.update(id, body);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete review (admin)' })
    remove(@Param('id') id: string) {
        return this.reviewsService.remove(id);
    }
}
