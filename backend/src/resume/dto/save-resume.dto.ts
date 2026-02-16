import { IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveResumeDto {
    @ApiProperty({
        description: 'Resume data payload',
        type: 'object',
        additionalProperties: true,
    })
    @IsNotEmpty()
    @IsObject()
    data: Record<string, any>;
}
