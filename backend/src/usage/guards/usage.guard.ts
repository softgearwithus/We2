import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsageService } from '../usage.service';
import { UsageSectionKey } from '../usage.constants';

export const USAGE_SECTION_KEY = 'usageSectionKey';
export const RequireSectionUsage = (sectionKey: UsageSectionKey | ((context: ExecutionContext) => UsageSectionKey)) =>
    SetMetadata(USAGE_SECTION_KEY, sectionKey);

@Injectable()
export class UsageGuard implements CanActivate {
    constructor(private readonly reflector: Reflector, private readonly usageService: UsageService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const sectionKeyOrResolver = this.reflector.getAllAndOverride<
            UsageSectionKey | ((context: ExecutionContext) => UsageSectionKey) | undefined
        >(USAGE_SECTION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!sectionKeyOrResolver) {
            return true;
        }

        const sectionKey = typeof sectionKeyOrResolver === 'function'
            ? sectionKeyOrResolver(context)
            : sectionKeyOrResolver;

        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        if (!userId) {
            return true;
        }

        await this.usageService.assertAllowed(userId, sectionKey);
        return true;
    }
}
