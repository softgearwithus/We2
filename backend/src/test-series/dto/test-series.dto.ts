import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUrl, IsNumber, IsEnum } from 'class-validator';

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


