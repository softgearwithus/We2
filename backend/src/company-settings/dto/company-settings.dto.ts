import {
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyMemberRole } from '../entities/company-member.entity';

const COMPANY_ROLES = [
  CompanyMemberRole.OWNER,
  CompanyMemberRole.ADMIN,
  CompanyMemberRole.MEMBER,
] as const;

const API_KEY_SCOPES = [
  'assessments:read',
  'assessments:write',
  'candidates:read',
  'candidates:write',
  'reports:read',
] as const;

export class UpdateCompanyProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  legalName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  supportEmail?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  verificationEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  productType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  domain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  companyContext?: string;

  @IsOptional()
  hiringDefaults?: Record<string, any>;
}

export class InviteCompanyMemberDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsIn(COMPANY_ROLES)
  role?: CompanyMemberRole;
}

export class AcceptCompanyInviteDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  twoFactorCode?: string;
}

export class UpdateCompanyMemberDto {
  @IsIn([CompanyMemberRole.ADMIN, CompanyMemberRole.MEMBER])
  role: CompanyMemberRole.ADMIN | CompanyMemberRole.MEMBER;
}

export class CreateCompanyBillingOrderDto {
  @IsString()
  @IsIn(['company_pro_1m'])
  plan: string;
}

export class VerifyCompanyBillingDto {
  @IsString()
  @IsNotEmpty()
  plan: string;

  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}

export class CreateCompanyApiKeyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @ApiProperty({ example: 'Production ATS sync' })
  name: string;

  @IsArray()
  @IsIn(API_KEY_SCOPES, { each: true })
  scopes: string[];
}

export class DeactivateCompanyAccountDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}

export const COMPANY_API_KEY_SCOPES = API_KEY_SCOPES;
