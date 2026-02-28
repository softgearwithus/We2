import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsageSectionKey } from '../usage.constants';

export const USAGE_SECTION_KEY = 'usageSectionKey';
export const RequireSectionUsage = (sectionKey: UsageSectionKey | ((context: ExecutionContext) => UsageSectionKey)) =>
    SetMetadata(USAGE_SECTION_KEY, sectionKey);

@Injectable()
export class UsageGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        return true;
    }
}
