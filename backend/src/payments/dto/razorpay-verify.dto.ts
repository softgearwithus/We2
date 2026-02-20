import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class RazorpayVerifyDto {
    @ApiProperty({ example: 'order_9A33XWu170gUtm' })
    @IsString()
    orderId: string;

    @ApiProperty({ example: 'pay_29QQoUBi66xm2f' })
    @IsString()
    paymentId: string;

    @ApiProperty({ example: 'generated_signature' })
    @IsString()
    signature: string;

    @ApiProperty({ example: 'standard_tier', enum: ['standard_tier', 'pro_tier'] })
    @IsIn(['standard_tier', 'pro_tier'])
    plan: string;

    @ApiProperty({ example: 'monthly', enum: ['monthly', 'yearly'] })
    @IsIn(['monthly', 'yearly'])
    billingCycle: 'monthly' | 'yearly';
}
