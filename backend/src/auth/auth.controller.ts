import { Body, Controller, Post, HttpCode, HttpStatus, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
    RegisterDto,
    LoginDto,
    RequestOtpDto,
    VerifyOtpDto,
    RequestPasswordResetDto,
    ResetPasswordDto,
} from './dto/auth.dto';
import { EmailOtpService } from './services/email-otp.service';
import { Public, Roles } from './decorators/auth.decorators';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '../users/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private emailOtpService: EmailOtpService,
    ) { }

    @Public()
    @Post('register/request-otp')
    @ApiOperation({ summary: 'Request OTP for student signup' })
    async requestOtp(@Body() dto: RequestOtpDto) {
        return this.emailOtpService.requestOtp(dto.email);
    }

    @Public()
    @Post('register/verify-otp')
    @ApiOperation({ summary: 'Verify OTP for student signup' })
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.emailOtpService.verifyOtp(dto.email, dto.otp);
    }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({
        status: 201,
        description: 'User successfully registered',
        schema: {
            example: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                email: 'student@example.com',
                role: 'student',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 409, description: 'Email already exists' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('password/forgot/request-otp')
    @ApiOperation({ summary: 'Request OTP for student password reset' })
    @ApiBody({ type: RequestPasswordResetDto })
    @ApiResponse({ status: 200, description: 'If account exists, OTP has been sent' })
    async requestPasswordResetOtp(@Body() dto: RequestPasswordResetDto) {
        return this.authService.requestStudentPasswordReset(dto.identifier);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('password/forgot/reset')
    @ApiOperation({ summary: 'Reset student password using OTP' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ status: 200, description: 'Password reset successful' })
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetStudentPassword(dto);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 200,
        description: 'User successfully logged in',
        schema: {
            example: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    email: 'student@example.com',
                    role: 'student',
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    @ApiResponse({ status: 429, description: 'Too many requests' })
    async login(@Body() loginDto: LoginDto, @Request() req: any) {
        return this.authService.login(loginDto, req);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    @ApiOperation({ summary: 'Logout and revoke current session' })
    @ApiResponse({ status: 200, description: 'Session revoked successfully' })
    async logout(@Request() req: any) {
        return this.authService.logout(req.user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Post('impersonate/:id')
    @ApiOperation({ summary: 'Super Admin ONLY: Impersonate a user account securely.' })
    async impersonate(@Param('id') id: string) {
        return this.authService.impersonate(id);
    }
}
