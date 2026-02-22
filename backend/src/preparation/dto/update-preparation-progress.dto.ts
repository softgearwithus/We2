import { IsArray, IsString } from 'class-validator';

export class UpdatePreparationProgressDto {
    @IsArray()
    @IsString({ each: true })
    completedPhaseIds: string[];
}
