import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeamDto {
  @ApiProperty({ example: 'Beta Squad', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 8, required: false })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(10)
  maxMembers?: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
