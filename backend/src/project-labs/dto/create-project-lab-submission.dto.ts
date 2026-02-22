import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateProjectLabSubmissionDto {
    @ApiProperty({ example: 'https://github.com/user/project' })
    @IsString()
    repositoryUrl: string;

    @ApiProperty({ required: false, example: 'https://project.vercel.app' })
    @IsOptional()
    @IsString()
    liveDemoUrl?: string;
}
