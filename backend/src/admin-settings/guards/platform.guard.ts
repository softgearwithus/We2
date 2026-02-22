import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AdminSettingsService } from '../admin-settings.service';
import { UserRole } from '../../users/user.entity';

@Injectable()
export class PlatformGuard implements CanActivate {
    constructor(private readonly adminSettingsService: AdminSettingsService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const role: UserRole | undefined = request.user?.role;
        const path: string = request.originalUrl || request.url || request.route?.path || '';

        await this.adminSettingsService.ensureMaintenanceAllowed(path, role);
        return true;
    }
}
