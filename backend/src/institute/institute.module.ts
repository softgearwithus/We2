import { Module } from '@nestjs/common';
import { InstituteController } from './institute.controller';
import { CollegesModule } from '../colleges/colleges.module';

@Module({
    imports: [CollegesModule],
    controllers: [InstituteController],
})
export class InstituteModule {}
