import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AdminSettingsService } from '../admin-settings.service';
import { UserRole } from '../../users/user.entity';

@Injectable()
export class PlatformGuard implements CanActivate {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const role: UserRole | undefined = request.user?.role;
    const path: string =
      request.originalUrl || request.url || request.route?.path || '';

    if (path.startsWith('/admin') || path.startsWith('/auth/login')) {
      return true;
    }

    try {
      await this.adminSettingsService.ensureMaintenanceAllowed(path, role);
    } catch (error: any) {
      if (error?.message === 'Platform is under maintenance.') {
        const settings = await this.adminSettingsService.getPlatformSettings();
        throw new ServiceUnavailableException({
          message: error.message,
          supportEmail: settings.supportEmail || null,
        });
      }
      throw error;
    }
    return true;
  }
}
