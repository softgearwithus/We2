import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateMentorPaymentOrderDto {
    @ApiProperty()
    @IsString()
    mentorId: string;

    @ApiProperty()
    @IsInt()
    @Min(15)
    durationMinutes: number;
}

export class VerifyMentorPaymentDto {
    @ApiProperty()
    @IsString()
    mentorId: string;

    @ApiProperty()
    @IsString()
    paymentId: string;

    @ApiProperty()
    @IsString()
    orderId: string;

    @ApiProperty()
    @IsString()
    signature: string;

    @ApiProperty()
    @IsString()
    topic: string;

    @ApiProperty()
    @IsInt()
    @Min(15)
    durationMinutes: number;
}
