import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWriteXQuestionDto {
    @ApiProperty({ example: 'Write a 150-200 word response on your favorite technology.' })
    @IsString()
    @IsNotEmpty()
    prompt: string;

    @ApiProperty({ required: false, example: true })
    @IsOptional()
    @IsBoolean()
    active?: boolean;
}
