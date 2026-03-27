import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  BadRequestException,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadLimitInterceptor } from '../admin-settings/interceptors/upload-limit.interceptor';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';
import * as crypto from 'crypto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminSettingsService } from '../admin-settings/admin-settings.service';

export class UpgradeSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(/^pro_1m$/, { message: 'Only pro_1m is supported' })
  @ApiProperty({
    example: 'pro_1m',
    description: 'The identifier for the subscription plan',
  })
  plan: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiProperty({
    example: 'pay_xxxxxxxxxxxxxx',
    required: false,
    description: 'Optional ID linking to the payment processor transaction',
  })
  paymentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  orderId?: string;

  @IsOptional()
  @IsString()
  signature?: string;
}

export class CreateUpgradeOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(/^pro_1m$/, { message: 'Only pro_1m is supported' })
  @ApiProperty({
    example: 'pro_1m',
    description: 'The identifier for the subscription plan',
  })
  plan: string;
}

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminSettingsService: AdminSettingsService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'student@example.com',
        role: 'student',
        createdAt: '2026-02-11T01:00:00.000Z',
        updatedAt: '2026-02-11T01:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get user dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getDashboardStats(@Request() req: any) {
    return this.usersService.getDashboardStats(req.user.id);
  }

  @Get('my/subscription/payments')
  @ApiOperation({ summary: 'Get current user subscription payment history' })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved successfully',
  })
  async getMySubscriptionPayments(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.getMySubscriptionPayments(
      req.user.id,
      limit ? Number(limit) : 25,
    );
  }

  @Get('me/credits')
  @ApiOperation({ summary: 'Get user credit remaining sizes' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getUserCredits(@Request() req: any) {
    return this.usersService.getUserCredits(req.user.id);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Post('profile/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload user profile avatar' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
    UploadLimitInterceptor,
  )
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const fileUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(req.user.id, fileUrl);
  }

  @Post('upgrade')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upgrade user subscription plan' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { plan: { type: 'string', example: 'pro_1m' } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription upgraded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (string too long, empty, or missing)',
  })
  @ApiResponse({
    status: 403,
    description: 'Upgrades are temporarily disabled',
  })
  async upgradeSubscription(
    @Request() req: any,
    @Body() upgradeDto: UpgradeSubscriptionDto,
  ) {
    const { plan, paymentId, orderId, signature } = upgradeDto;
    const settings = await this.adminSettingsService.getPlatformSettings();
    if (!settings.upgradesEnabled) {
      throw new ForbiddenException('Upgrades are temporarily disabled');
    }

    if (!orderId || !paymentId || !signature) {
      throw new BadRequestException(
        'Payment verification details are required.',
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new ForbiddenException('Payment verification is not configured.');
    }
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    return this.usersService.upgradeSubscription(
      req.user.id,
      plan,
      paymentId,
      orderId,
    );
  }

  @Post('upgrade-order')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Razorpay order for plan upgrade' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createUpgradeOrder(
    @Request() req: any,
    @Body() dto: CreateUpgradeOrderDto,
  ) {
    const settings = await this.adminSettingsService.getPlatformSettings();
    if (!settings.upgradesEnabled) {
      throw new ForbiddenException('Upgrades are temporarily disabled');
    }
    return this.usersService.createUpgradeOrder(req.user.id, dto.plan);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Users list retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllUsers(@Query('role') role?: string) {
    return this.usersService.findAll(role);
  }
}
