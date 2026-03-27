import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, ResetPasswordDto } from './dto/auth.dto';
import { EmailOtpService } from './services/email-otp.service';
import { Request } from 'express';
import { UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailOtpService: EmailOtpService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, role, firstName, lastName, timezone } =
      registerDto;
    if ((role || 'student') === 'student') {
      await this.emailOtpService.assertVerified(email);
    }
    const user = await this.usersService.create(
      email,
      password,
      role,
      firstName,
      lastName,
      timezone,
    );
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async login(loginDto: LoginDto, request?: Request) {
    const { email, password, role } = loginDto;

    const user =
      (await this.usersService.findByEmail(email)) ||
      (await this.usersService.findByCredentialId(email));

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.isActive === false) {
      throw new UnauthorizedException('Account disabled');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (role && user.role !== role) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const rawUserAgent = request?.headers?.['user-agent'];
    const userAgent = Array.isArray(rawUserAgent)
      ? rawUserAgent.join(' ')
      : rawUserAgent || null;

    const sessionVersion = await this.usersService.rotateSessionVersion(
      user.id,
      request?.ip || null,
      userAgent,
    );

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sv: sessionVersion,
    };

    let accessToken: string;
    if (loginDto.rememberMe) {
      accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      });
    } else {
      accessToken = await this.jwtService.signAsync(payload);
    }

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        credentialId: (user as any).credentialId || null,
        collegeId: (user as any).collegeId || null,
        department: (user as any).department || null,
        year: (user as any).year || null,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEndDate: user.subscriptionEndDate,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async impersonate(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === 'super_admin') {
      throw new ForbiddenException('Cannot impersonate Super Admin');
    }
    if (user.isActive === false) {
      throw new UnauthorizedException('Account disabled');
    }

    const sessionVersion = await this.usersService.rotateSessionVersion(
      user.id,
    );
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sv: sessionVersion,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        credentialId: (user as any).credentialId || null,
        collegeId: (user as any).collegeId || null,
        department: (user as any).department || null,
        year: (user as any).year || null,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEndDate: user.subscriptionEndDate,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async logout(userId: string) {
    await this.usersService.revokeAllSessions(userId);
    return { success: true };
  }

  async requestStudentPasswordReset(identifier: string) {
    const normalized = identifier.toLowerCase().trim();
    let user = await this.usersService.findByEmail(normalized);
    if (!user) {
      user = await this.usersService.findByCredentialId(identifier.trim());
    }

    if (user && user.role === UserRole.STUDENT && user.isActive !== false) {
      await this.emailOtpService.requestPasswordResetOtp(user.email);
    }

    return { success: true };
  }

  async resetStudentPassword(dto: ResetPasswordDto) {
    const rawIdentifier = dto.identifier.trim();
    const normalized = rawIdentifier.toLowerCase();
    const user =
      (await this.usersService.findByEmail(normalized)) ||
      (await this.usersService.findByCredentialId(rawIdentifier));

    if (!user || user.role !== UserRole.STUDENT || user.isActive === false) {
      throw new UnauthorizedException('Invalid reset request.');
    }

    await this.emailOtpService.verifyPasswordResetOtp(user.email, dto.otp);
    await this.emailOtpService.consumePasswordResetOtp(user.email);
    await this.usersService.updatePasswordAndRevokeSessions(
      user.id,
      dto.newPassword,
    );

    return { success: true };
  }
}
