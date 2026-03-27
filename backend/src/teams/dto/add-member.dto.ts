import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TeamMemberRole } from '../entities/team-member.entity';

export class AddMemberDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID to add to the team',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    enum: TeamMemberRole,
    example: TeamMemberRole.DEVELOPER,
    description: 'Role of the member in the team',
    default: TeamMemberRole.DEVELOPER,
    required: false,
  })
  @IsOptional()
  @IsEnum(TeamMemberRole)
  role?: TeamMemberRole;
}
