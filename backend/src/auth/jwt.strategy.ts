import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
        });
    }

    async validate(payload: any) {
        const user = await this.usersService.findById(payload.sub);
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            collegeId: (user as any).collegeId || null,
            department: (user as any).department || null,
            year: (user as any).year || null,
        };
    }
}
