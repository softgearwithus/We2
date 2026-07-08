import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, ResetPasswordDto } from './dto/auth.dto';
import { TwoFactorLoginDto } from './dto/two-factor-login.dto';
import { EmailOtpService } from './services/email-otp.service';
import { Request } from 'express';
import { UserRole } from '../users/user.entity';

type AuthUserResponse = {
  id: string;
  email: string;
  role: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionEndDate: Date | null;
  firstName: string | null;
  lastName: string | null;
  isTwoFactorEnabled: boolean;
  credentialId: string | null;
  collegeId: string | null;
  department: string | null;
  year: string | null;
};

type TwoFactorPayload = {
  sub: string;
  email: string;
  role: string;
  purpose: 'two_factor';
  rememberMe?: boolean;
};

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
    const normalizedRole = (role || UserRole.STUDENT).toLowerCase();
    if (normalizedRole !== UserRole.STUDENT) {
      throw new ForbiddenException(
        'Only student self-registration is allowed. Contact admin for other roles.',
      );
    }
    await this.emailOtpService.assertVerified(email);
    const user = await this.usersService.create(
      email,
      password,
      UserRole.STUDENT,
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

  private toAuthUserResponse(user: {
    id: string;
    email: string;
    role: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    subscriptionEndDate: Date | null;
    firstName: string | null;
    lastName: string | null;
    isTwoFactorEnabled?: boolean;
    twoFactorSecret?: string | null;
    credentialId?: string | null;
    collegeId?: string | null;
    department?: string | null;
    year?: string | null;
  }): AuthUserResponse {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate,
      firstName: user.firstName,
      lastName: user.lastName,
      isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled && user.twoFactorSecret),
      credentialId: user.credentialId || null,
      collegeId: user.collegeId || null,
      department: user.department || null,
      year: user.year || null,
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

    if (user.isTwoFactorEnabled && user.twoFactorSecret) {
      const twoFactorToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          purpose: 'two_factor',
          rememberMe: Boolean(loginDto.rememberMe),
        },
        { expiresIn: '5m' },
      );
      return {
        requiresTwoFactor: true,
        twoFactorToken,
        user: this.toAuthUserResponse(user),
      };
    }

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
      user: this.toAuthUserResponse(user),
    };
  }

  async issueAccessTokenForUser(
    user: {
      id: string;
      email: string;
      role: string;
      subscriptionPlan: string;
      subscriptionStatus: string;
      subscriptionEndDate: Date | null;
      firstName: string | null;
      lastName: string | null;
      isTwoFactorEnabled?: boolean;
      twoFactorSecret?: string | null;
      credentialId?: string | null;
      collegeId?: string | null;
      department?: string | null;
      year?: string | null;
    },
    request?: Request,
    rememberMe = false,
  ) {
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
    const accessToken = rememberMe
      ? await this.jwtService.signAsync(payload, { expiresIn: '7d' })
      : await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: this.toAuthUserResponse(user),
    };
  }

  async verifyTwoFactorLogin(dto: TwoFactorLoginDto, request?: Request) {
    let payload: TwoFactorPayload;
    try {
      payload = await this.jwtService.verifyAsync<TwoFactorPayload>(
        dto.twoFactorToken,
      );
    } catch {
      throw new UnauthorizedException('Two-factor session expired.');
    }
    if (payload.purpose !== 'two_factor') {
      throw new UnauthorizedException('Invalid two-factor session.');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException('Two-factor authentication is disabled.');
    }
    const valid = await this.usersService.verifyTwoFactorCode(user.id, dto.code);
    if (!valid) {
      throw new UnauthorizedException('Invalid two-factor code.');
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
    const accessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sv: sessionVersion,
    };
    const rememberMe = Boolean(dto.rememberMe ?? payload.rememberMe);
    const accessToken = rememberMe
      ? await this.jwtService.signAsync(accessPayload, { expiresIn: '7d' })
      : await this.jwtService.signAsync(accessPayload);

    return {
      accessToken,
      user: this.toAuthUserResponse(user),
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
      user: this.toAuthUserResponse(user),
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
