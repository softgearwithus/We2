import {
    Body,
    Controller,
    Post,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { RazorpayOrderDto } from './dto/razorpay-order.dto';
import { RazorpayVerifyDto } from './dto/razorpay-verify.dto';
import { UsersService } from '../users/users.service';

@ApiTags('payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly usersService: UsersService,
    ) {}

    @Get('razorpay/key')
    @ApiOperation({ summary: 'Get Razorpay public key' })
    @ApiResponse({ status: 200, description: 'Key retrieved' })
    getKey() {
        return this.paymentsService.getPublicKey();
    }

    @Post('razorpay/order')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Create Razorpay order' })
    @ApiResponse({ status: 200, description: 'Order created' })
    createOrder(@Request() req: any, @Body() body: RazorpayOrderDto) {
        return this.paymentsService.createOrder(body.plan, body.billingCycle, req.user.id);
    }

    @Post('razorpay/verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify Razorpay payment signature' })
    @ApiResponse({ status: 200, description: 'Verification result' })
    async verifyPayment(@Request() req: any, @Body() body: RazorpayVerifyDto) {
        const isValid = this.paymentsService.verifySignature(body.orderId, body.paymentId, body.signature);
        if (!isValid) {
            return { valid: false };
        }
        const order = await this.paymentsService.fetchOrder(body.orderId);
        const orderPlan = order?.notes?.plan;
        const orderCycle = order?.notes?.billingCycle;
        const orderUser = order?.notes?.userId;

        if (orderPlan !== body.plan || orderCycle !== body.billingCycle || String(orderUser) !== String(req.user.id)) {
            return { valid: false };
        }

        const user = await this.usersService.activateSubscription(req.user.id, body.plan, body.billingCycle);
        return { valid: true, user };
    }
}
