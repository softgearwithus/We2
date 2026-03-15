import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateWriteXQuestionDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    prompt?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    topicKey?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    topicLabel?: string;
}
