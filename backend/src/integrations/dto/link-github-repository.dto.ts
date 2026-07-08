import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class LinkGithubRepositoryDto {
  @IsUUID()
  repositoryId: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  branch?: string;
}
