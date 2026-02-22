import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageController } from './usage.controller';
import { UsageService } from './usage.service';
import { UserSectionUsage } from './entities/user-section-usage.entity';
import { UsersModule } from '../users/users.module';
import { UsageGuard } from './guards/usage.guard';

@Module({
    imports: [TypeOrmModule.forFeature([UserSectionUsage]), UsersModule],
    controllers: [UsageController],
    providers: [UsageService, UsageGuard],
    exports: [UsageService],
})
export class UsageModule {}
