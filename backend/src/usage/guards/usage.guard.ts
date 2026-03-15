import { BadRequestException, CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsageSectionKey } from '../usage.constants';
import { UsageService } from '../usage.service';
import { UserRole } from '../../users/user.entity';

export const USAGE_SECTION_KEY = 'usageSectionKey';
export const RequireSectionUsage = (sectionKey: UsageSectionKey | ((context: ExecutionContext) => UsageSectionKey)) =>
    SetMetadata(USAGE_SECTION_KEY, sectionKey);

@Injectable()
export class UsageGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly usageService: UsageService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const metadata = this.reflector.getAllAndOverride<UsageSectionKey | ((context: ExecutionContext) => UsageSectionKey)>(
            USAGE_SECTION_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!metadata) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userId: string | undefined = request?.user?.id;
        if (!userId) {
            return true;
        }

        if (request?.user?.role && request.user.role !== UserRole.STUDENT) {
            return true;
        }

        const sectionKey = typeof metadata === 'function' ? metadata(context) : metadata;
        const state = await this.usageService.heartbeat(userId, sectionKey);
        if (state.isLimited) {
            throw new BadRequestException('Free plan limit reached for this section.');
        }
        return true;
    }
}
