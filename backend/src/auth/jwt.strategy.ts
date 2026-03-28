import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { SESSION_REVOKED_CODE } from './constants';

type JwtSessionPayload = {
  sub: string;
  email?: string;
  role?: string;
  sv?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is required');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtSessionPayload) {
    const user = await this.usersService.findById(payload.sub);
    const tokenSessionVersion = Number.isFinite(payload?.sv ?? NaN)
      ? Number(payload.sv)
      : 0;
    const currentSessionVersion = Number(user.sessionVersion || 0);

    if (tokenSessionVersion !== currentSessionVersion) {
      throw new UnauthorizedException({
        code: SESSION_REVOKED_CODE,
        message:
          'Session expired because your account logged in on another device.',
      });
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId || null,
      department: user.department || null,
      year: user.year || null,
      sessionVersion: currentSessionVersion,
    };
  }
}
