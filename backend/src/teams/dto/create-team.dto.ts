import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
    @ApiProperty({ example: 'Alpha Squad', description: 'Team name' })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Full-stack development team for e-commerce project',
        description: 'Team description',
    })
    @IsString()
    description: string;

    @ApiProperty({
        example: 5,
        description: 'Maximum number of team members',
        default: 5,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(2)
    @Max(10)
    maxMembers?: number;
}
