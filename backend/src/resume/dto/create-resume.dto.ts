import { IsNotEmpty, IsObject, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResumeDto {
  @ApiProperty({
    description: 'Resume title',
    type: 'string',
    example: 'Software Engineer Role',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Resume data payload',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
