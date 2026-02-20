import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

type BillingCycle = 'monthly' | 'yearly';

@Injectable()
export class PaymentsService {
    private readonly razorpay: Razorpay;
    private readonly keyId: string;
    private readonly keySecret: string;

    constructor() {
        this.keyId = process.env.RAZORPAY_KEY_ID || '';
        this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';

        if (!this.keyId || !this.keySecret) {
            throw new Error('Missing Razorpay credentials');
        }

        this.razorpay = new Razorpay({
            key_id: this.keyId,
            key_secret: this.keySecret,
        });
    }

    getPublicKey() {
        return { keyId: this.keyId };
    }

    calculateAmount(plan: string, billingCycle: BillingCycle) {
        const prices = {
            standard_tier: 449,
            pro_tier: 799,
        } as const;

        const monthly = prices[plan as keyof typeof prices];
        if (!monthly) {
            throw new BadRequestException('Invalid plan');
        }

        if (billingCycle === 'yearly') {
            const yearly = Math.round(monthly * 12 * 0.8);
            return yearly * 100;
        }

        return monthly * 100;
    }

    async createOrder(plan: string, billingCycle: BillingCycle, userId: string) {
        const amount = this.calculateAmount(plan, billingCycle);
        const receiptBase = `sub_${userId.replace(/-/g, '').slice(0, 8)}_${Date.now().toString(36)}`;
        const receipt = receiptBase.slice(0, 40);
        try {
            return await this.razorpay.orders.create({
                amount,
                currency: 'INR',
                receipt,
                notes: {
                    plan,
                    billingCycle,
                    userId,
                },
            });
        } catch (error: any) {
            const message = error?.error?.description || error?.message || 'Failed to create Razorpay order';
            const status = error?.statusCode || error?.status;
            if (status && status < 500) {
                throw new BadRequestException(message);
            }
            throw new InternalServerErrorException(message);
        }
    }

    async fetchOrder(orderId: string) {
        try {
            return await this.razorpay.orders.fetch(orderId);
        } catch (error: any) {
            const message = error?.error?.description || error?.message || 'Failed to fetch Razorpay order';
            const status = error?.statusCode || error?.status;
            if (status && status < 500) {
                throw new BadRequestException(message);
            }
            throw new InternalServerErrorException(message);
        }
    }

    verifySignature(orderId: string, paymentId: string, signature: string) {
        const payload = `${orderId}|${paymentId}`;
        const expected = crypto
            .createHmac('sha256', this.keySecret)
            .update(payload)
            .digest('hex');

        return expected === signature;
    }
}
