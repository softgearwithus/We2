import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class RazorpayOrderDto {
    @ApiProperty({ example: 'standard_tier', enum: ['standard_tier', 'pro_tier'] })
    @IsIn(['standard_tier', 'pro_tier'])
    plan: string;

    @ApiProperty({ example: 'monthly', enum: ['monthly', 'yearly'] })
    @IsIn(['monthly', 'yearly'])
    billingCycle: 'monthly' | 'yearly';
}
