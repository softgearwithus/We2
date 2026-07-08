import { IsString, MaxLength } from 'class-validator';

export class FetchAssessmentContextUrlDto {
  @IsString()
  @MaxLength(2048)
  url: string;
}
