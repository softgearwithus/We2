import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AssessmentFileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  path: string;

  @IsString()
  content: string;
}
