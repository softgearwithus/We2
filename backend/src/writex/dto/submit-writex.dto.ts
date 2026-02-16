import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitWriteXDto {
    @ApiProperty({ example: 'question-id' })
    @IsString()
    @IsNotEmpty()
    questionId: string;

    @ApiProperty({ example: 'My response goes here...' })
    @IsString()
    @IsNotEmpty()
    answer: string;
}
