import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public, Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';
import { MentorsService } from './mentors.service';
import { CreateMentorApplicationDto } from './dto/create-mentor-application.dto';
import {
  CreateMentorPaymentOrderDto,
  VerifyMentorPaymentDto,
} from './dto/mentor-payment.dto';
import * as crypto from 'crypto';

@ApiTags('mentors')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @Get('mentors')
  @Roles(
    UserRole.STUDENT,
    UserRole.COLLEGE_ADMIN,
    UserRole.MENTOR,
    UserRole.COMPANY_ADMIN,
    UserRole.SUPER_ADMIN,
  )
  @ApiOperation({ summary: 'List active mentors' })
  async listMentors() {
    return this.mentorsService.listMentors();
  }

  @Post('mentor-applications')
  @Public()
  @ApiOperation({ summary: 'Submit mentor application' })
  async createApplication(@Body() payload: CreateMentorApplicationDto) {
    return this.mentorsService.createApplication(payload);
  }

  @Get('admin/mentor-applications')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List mentor applications' })
  async listApplications() {
    return this.mentorsService.listApplications();
  }

  @Post('admin/mentor-applications/:id/approve')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve mentor application' })
  async approveApplication(@Param('id') id: string) {
    return this.mentorsService.approveApplication(id);
  }

  @Post('admin/mentor-applications/:id/reject')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reject mentor application' })
  async rejectApplication(@Param('id') id: string) {
    return this.mentorsService.rejectApplication(id);
  }

  @Patch('admin/mentors/:id/status')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Enable/disable mentor profile' })
  async toggleMentor(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.mentorsService.setMentorStatus(id, body.isActive);
  }

  @Get('admin/mentors')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all mentors' })
  async listAllMentors() {
    return this.mentorsService.listAllMentors();
  }

  @Post('mentor-sessions')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Create mentor session after payment verification' })
  async createSession(
    @Request() req: any,
    @Body() payload: VerifyMentorPaymentDto,
  ) {
    return this.mentorsService.createSessionFromPayment(req.user.id, payload);
  }

  @Get('mentor-sessions')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'List student mentor sessions' })
  async listStudentSessions(@Request() req: any) {
    return this.mentorsService.listStudentSessions(req.user.id);
  }

  @Get('mentor/requests')
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'List mentor pending requests' })
  async listMentorRequests(@Request() req: any) {
    return this.mentorsService.listMentorRequests(req.user.id);
  }

  @Patch('mentor/requests/:id/accept')
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Accept mentor request and add meeting link' })
  async acceptRequest(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { meetingLink: string },
  ) {
    return this.mentorsService.acceptRequest(req.user.id, id, body.meetingLink);
  }

  @Patch('mentor/requests/:id/decline')
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Decline mentor request' })
  async declineRequest(@Request() req: any, @Param('id') id: string) {
    return this.mentorsService.declineRequest(req.user.id, id);
  }

  @Get('mentor/sessions')
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'List mentor sessions' })
  async listMentorSessions(@Request() req: any) {
    return this.mentorsService.listMentorSessions(req.user.id);
  }

  @Get('mentor/payouts')
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'List mentor payouts' })
  async listMentorPayouts(@Request() req: any) {
    return this.mentorsService.listMentorPayouts(req.user.id);
  }

  @Put('admin/mentor-payouts')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Log mentor payout' })
  async logPayout(
    @Body() body: { mentorId: string; amountInr: number; referenceId: string },
  ) {
    return this.mentorsService.recordPayout(
      body.mentorId,
      body.amountInr,
      body.referenceId,
    );
  }

  @Post('mentor-payments/order')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Create Razorpay order for mentor connect' })
  async createPaymentOrder(
    @Request() req: any,
    @Body() payload: CreateMentorPaymentOrderDto,
  ) {
    return this.mentorsService.createPaymentOrder(req.user.id, payload);
  }

  @Post('mentor-payments/verify')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Verify Razorpay payment and create session' })
  async verifyPayment(
    @Request() req: any,
    @Body() payload: VerifyMentorPaymentDto,
  ) {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new BadRequestException('Payment verification is not configured.');
    }
    const body = `${payload.orderId}|${payload.paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    if (expectedSignature !== payload.signature) {
      throw new BadRequestException('Invalid payment signature');
    }
    return this.mentorsService.createSessionFromPayment(req.user.id, payload);
  }

  @Get('admin/mentor-payouts')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all mentor payouts' })
  async listAllPayouts() {
    return this.mentorsService.listAllPayouts();
  }

  @Get('admin/mentor-sessions')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all mentor sessions' })
  async listAllSessions() {
    return this.mentorsService.listAllSessions();
  }
}
