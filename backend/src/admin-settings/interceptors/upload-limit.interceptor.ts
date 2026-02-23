import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AdminSettingsService } from '../admin-settings.service';

@Injectable()
export class UploadLimitInterceptor implements NestInterceptor {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;
    const files = request.files;
    const size =
      (Array.isArray(files)
        ? files.reduce((total, current) => total + (current?.size || 0), 0)
        : 0) + (file?.size || 0);

    if (size > 0) {
      const settings = await this.adminSettingsService.getPlatformSettings();
      const limitBytes = (settings.maxUploadSizeMB || 10) * 1024 * 1024;
      if (size > limitBytes) {
        throw new PayloadTooLargeException(
          `File exceeds max upload size of ${settings.maxUploadSizeMB}MB.`,
        );
      }
    }

    return next.handle();
  }
}
