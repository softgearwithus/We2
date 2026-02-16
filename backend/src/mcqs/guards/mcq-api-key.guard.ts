import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class McqApiKeyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];
        if (!apiKey || apiKey !== process.env.MCQ_IMPORT_API_KEY) {
            throw new UnauthorizedException('Invalid API key');
        }
        return true;
    }
}
