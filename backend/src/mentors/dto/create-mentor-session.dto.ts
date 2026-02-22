import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateMentorSessionDto {
    @ApiProperty()
    @IsString()
    mentorId: string;

    @ApiProperty()
    @IsString()
    topic: string;

    @ApiProperty()
    @IsInt()
    @Min(15)
    durationMinutes: number;
}
