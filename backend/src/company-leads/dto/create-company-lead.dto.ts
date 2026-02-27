import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCompanyLeadDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(150)
    name: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(150)
    companyName: string;

    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    email: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    phone?: string;
}
