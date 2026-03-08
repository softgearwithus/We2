import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './decorators/auth.decorators';
import { SESSION_REVOKED_CODE } from './constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true; // Skip JWT authentication for @Public routes
        }

        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            if (err instanceof UnauthorizedException) {
                const response = err.getResponse();
                const code = typeof response === 'object' && response
                    ? (response as any).code || (response as any).message?.code
                    : null;
                if (code === SESSION_REVOKED_CODE) {
                    throw err;
                }
            }
            throw err || new UnauthorizedException({
                code: 'INVALID_OR_EXPIRED_TOKEN',
                message: 'Invalid or expired token',
            });
        }
        return user;
    }
}
