import {
  BadRequestException,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailClient } from '@azure/communication-email';
import bcrypt from 'bcrypt';
import { EmailOtp, EmailOtpPurpose } from '../entities/email-otp.entity';

const OTP_EXPIRY_MINUTES = 10;
const OTP_MIN_INTERVAL_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

@Injectable()
export class EmailOtpService {
  private readonly client: EmailClient;
  private readonly senderAddress: string;

  constructor(
    @InjectRepository(EmailOtp)
    private readonly otpRepo: Repository<EmailOtp>,
  ) {
    const connectionString =
      process.env.COMMUNICATION_SERVICES_CONNECTION_STRING || '';
    const senderAddress = process.env.COMMUNICATION_SERVICES_SENDER || '';
    if (!connectionString) {
      throw new Error('COMMUNICATION_SERVICES_CONNECTION_STRING is required');
    }
    if (!senderAddress) {
      throw new Error('COMMUNICATION_SERVICES_SENDER is required');
    }
    this.client = new EmailClient(connectionString);
    this.senderAddress = senderAddress;
  }

  private normalizeEmail(email: string) {
    return email.toLowerCase().trim();
  }

  private generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async requestOtpForPurpose(
    email: string,
    purpose: EmailOtpPurpose,
    subject: string,
    bodyLine: string,
  ) {
    const normalizedEmail = this.normalizeEmail(email);
    const now = new Date();
    const existing = await this.otpRepo.findOne({
      where: { email: normalizedEmail, purpose },
    });

    if (existing?.lastSentAt) {
      const secondsSinceLast =
        (now.getTime() - existing.lastSentAt.getTime()) / 1000;
      if (secondsSinceLast < OTP_MIN_INTERVAL_SECONDS) {
        throw new HttpException(
          'Please wait before requesting another OTP.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const otp = this.generateOtp();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

    if (existing) {
      existing.otpHash = otpHash;
      existing.expiresAt = expiresAt;
      existing.attempts = 0;
      existing.lastSentAt = now;
      existing.verifiedAt = null;
      existing.consumedAt = null;
      await this.otpRepo.save(existing);
    } else {
      await this.otpRepo.save(
        this.otpRepo.create({
          email: normalizedEmail,
          purpose,
          otpHash,
          expiresAt,
          attempts: 0,
          lastSentAt: now,
          verifiedAt: null,
          consumedAt: null,
        }),
      );
    }

    const emailMessage = {
      senderAddress: this.senderAddress,
      content: {
        subject,
        plainText: `Your EMBLE verification code is ${otp}. ${bodyLine} It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
        html: `<html><body><h2>Your EMBLE verification code</h2><p>Use <strong>${otp}</strong>. ${bodyLine}</p><p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p></body></html>`,
      },
      recipients: {
        to: [{ address: normalizedEmail }],
      },
    } as any;

    try {
      const poller = await this.client.beginSend(emailMessage);
      const result: any = await poller.pollUntilDone();
      if (
        result?.status &&
        String(result.status).toLowerCase() !== 'succeeded'
      ) {
        const errorMessage =
          result?.error?.message ||
          result?.error?.name ||
          'Email delivery failed.';
        throw new HttpException(errorMessage, HttpStatus.BAD_GATEWAY);
      }
    } catch (error: any) {
      const rawMessage = error?.message || 'Email delivery failed.';
      const status = rawMessage.includes('EmailDroppedAllRecipientsSuppressed')
        ? HttpStatus.BAD_REQUEST
        : HttpStatus.BAD_GATEWAY;
      throw new HttpException(rawMessage, status);
    }

    return { success: true };
  }

  async requestOtp(email: string) {
    return this.requestOtpForPurpose(
      email,
      EmailOtpPurpose.REGISTER,
      'Your EMBLE verification code',
      'Use this code to finish creating your account.',
    );
  }

  async requestPasswordResetOtp(email: string) {
    return this.requestOtpForPurpose(
      email,
      EmailOtpPurpose.PASSWORD_RESET,
      'Your EMBLE password reset code',
      'Use this code to reset your password.',
    );
  }

  private async verifyOtpForPurpose(
    email: string,
    otp: string,
    purpose: EmailOtpPurpose,
  ) {
    const normalizedEmail = this.normalizeEmail(email);
    const record = await this.otpRepo.findOne({
      where: { email: normalizedEmail, purpose },
    });
    if (!record) {
      throw new BadRequestException('Invalid OTP.');
    }

    if (record.consumedAt) {
      throw new BadRequestException('OTP already used. Request a new code.');
    }

    if (record.verifiedAt) {
      return { verified: true };
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP expired.');
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      throw new HttpException(
        'Too many attempts. Request a new OTP.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      record.attempts += 1;
      await this.otpRepo.save(record);
      throw new BadRequestException('Invalid OTP.');
    }

    record.verifiedAt = new Date();
    await this.otpRepo.save(record);
    return { verified: true };
  }

  async verifyOtp(email: string, otp: string) {
    return this.verifyOtpForPurpose(email, otp, EmailOtpPurpose.REGISTER);
  }

  async verifyPasswordResetOtp(email: string, otp: string) {
    return this.verifyOtpForPurpose(email, otp, EmailOtpPurpose.PASSWORD_RESET);
  }

  async assertVerified(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const record = await this.otpRepo.findOne({
      where: { email: normalizedEmail, purpose: EmailOtpPurpose.REGISTER },
    });
    if (!record?.verifiedAt) {
      throw new BadRequestException('Email verification required.');
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP expired. Please request a new code.');
    }
    return true;
  }

  async consumePasswordResetOtp(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const record = await this.otpRepo.findOne({
      where: {
        email: normalizedEmail,
        purpose: EmailOtpPurpose.PASSWORD_RESET,
      },
    });

    if (!record?.verifiedAt) {
      throw new BadRequestException('Password reset verification required.');
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP expired. Please request a new code.');
    }
    if (record.consumedAt) {
      throw new BadRequestException('OTP already used. Request a new code.');
    }

    record.consumedAt = new Date();
    await this.otpRepo.save(record);
    return true;
  }
}
