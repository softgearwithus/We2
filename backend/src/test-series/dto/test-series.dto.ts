import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUrl, IsNumber, IsEnum, IsArray } from 'class-validator';

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsUrl()
    logoUrl?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateCompanyDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsUrl()
    logoUrl?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class BulkQuestionsDto {
    @IsArray()
    @IsNotEmpty()
    questions: any[];
}

export class SubmitMockTestDto {
    @IsString()
    startTime: string;

    @IsString()
    endTime: string;

    @IsArray()
    responses: { questionId: string, responseValue: string, timeSpentSeconds: number }[];
}
