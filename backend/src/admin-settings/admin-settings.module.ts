import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSettingsController } from './admin-settings.controller';
import { AdminSettingsService } from './admin-settings.service';
import { AdminUpdateFlag } from './entities/admin-update-flag.entity';
import { PlatformSettings } from './entities/platform-settings.entity';
import { UsersModule } from '../users/users.module';
import { PlatformGuard } from './guards/platform.guard';
import { LastActiveInterceptor } from './interceptors/last-active.interceptor';

@Module({
    imports: [TypeOrmModule.forFeature([AdminUpdateFlag, PlatformSettings]), UsersModule],
    controllers: [AdminSettingsController],
    providers: [AdminSettingsService, PlatformGuard, LastActiveInterceptor],
    exports: [AdminSettingsService],
})
export class AdminSettingsModule {}
