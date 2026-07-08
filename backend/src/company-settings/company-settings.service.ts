import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { createHash, createHmac, randomBytes } from 'crypto';
import { In, Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { EmailOtpService } from '../auth/services/email-otp.service';
import { Placement } from '../placements/entities/placement.entity';
import { HiringAssessment } from '../placements/entities/hiring-assessment.entity';
import { Application } from '../applications/entities/application.entity';
import { GithubRepository } from '../integrations/entities/github-repository.entity';
import {
  AcceptCompanyInviteDto,
  COMPANY_API_KEY_SCOPES,
  CreateCompanyApiKeyDto,
  CreateCompanyBillingOrderDto,
  DeactivateCompanyAccountDto,
  InviteCompanyMemberDto,
  UpdateCompanyMemberDto,
  UpdateCompanyProfileDto,
  VerifyCompanyBillingDto,
} from './dto/company-settings.dto';
import {
  CompanyMember,
  CompanyMemberRole,
} from './entities/company-member.entity';
import {
  CompanyInvite,
  CompanyInviteEmailDeliveryStatus,
  CompanyInviteStatus,
} from './entities/company-invite.entity';
import { CompanyProfile } from './entities/company-profile.entity';
import { CompanyBillingOrder } from './entities/company-billing-order.entity';
import { CompanyApiKey } from './entities/company-api-key.entity';
import { CompanyAuditLog } from './entities/company-audit-log.entity';
import { CompanyScopeService } from './company-scope.service';

const COMPANY_PRO_PLAN = 'company_pro_1m';
const COMPANY_PRO_PRICE_IN_PAISE = 499900;

@Injectable()
export class CompanySettingsService {
  constructor(
    @InjectRepository(CompanyProfile)
    private readonly profilesRepo: Repository<CompanyProfile>,
    @InjectRepository(CompanyMember)
    private readonly membersRepo: Repository<CompanyMember>,
    @InjectRepository(CompanyInvite)
    private readonly invitesRepo: Repository<CompanyInvite>,
    @InjectRepository(CompanyBillingOrder)
    private readonly billingRepo: Repository<CompanyBillingOrder>,
    @InjectRepository(CompanyApiKey)
    private readonly apiKeysRepo: Repository<CompanyApiKey>,
    @InjectRepository(CompanyAuditLog)
    private readonly auditRepo: Repository<CompanyAuditLog>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Placement)
    private readonly placementsRepo: Repository<Placement>,
    @InjectRepository(HiringAssessment)
    private readonly assessmentsRepo: Repository<HiringAssessment>,
    @InjectRepository(Application)
    private readonly applicationsRepo: Repository<Application>,
    @InjectRepository(GithubRepository)
    private readonly githubRepo: Repository<GithubRepository>,
    private readonly usersService: UsersService,
    private readonly companyScope: CompanyScopeService,
    private readonly authService: AuthService,
    private readonly emailService: EmailOtpService,
  ) {}

  async getProfileForCompany(companyId: string) {
    await this.companyScope.ensureOwnerWorkspace(companyId);
    const profile = await this.profilesRepo.findOne({ where: { companyId } });
    if (!profile) throw new NotFoundException('Company profile not found.');
    return profile;
  }

  async getProfile(actor: { id: string; email?: string; role?: string }) {
    const companyId = await this.companyScope.resolveCompanyId(
      actor.id,
      actor.role,
    );
    const [profile, techContext] = await Promise.all([
      this.getProfileForCompany(companyId),
      this.getRepositoryTechContext(companyId),
    ]);
    return { ...profile, techContext };
  }

  async updateProfile(
    actor: { id: string; email?: string; role?: string },
    dto: UpdateCompanyProfileDto,
  ) {
    const membership = await this.companyScope.assertCompanyAdmin(
      actor.id,
      actor.role,
    );
    const profile = await this.getProfileForCompany(membership.companyId);

    if (dto.slug !== undefined) {
      const slug = this.normalizeSlug(dto.slug);
      const existing = await this.profilesRepo.findOne({ where: { slug } });
      if (existing && existing.companyId !== membership.companyId) {
        throw new ConflictException('Company slug is already taken.');
      }
      profile.slug = slug;
    }

    const stringFields: Array<keyof UpdateCompanyProfileDto> = [
      'displayName',
      'legalName',
      'website',
      'supportEmail',
      'verificationEmail',
      'logoUrl',
      'description',
      'industry',
      'productType',
      'domain',
      'companyContext',
    ];
    for (const field of stringFields) {
      if (dto[field] !== undefined) {
        (profile as any)[field] = this.emptyToNull(dto[field] as string);
      }
    }
    if (!profile.displayName) {
      throw new BadRequestException('Display name is required.');
    }
    if (dto.hiringDefaults !== undefined) {
      profile.hiringDefaults = dto.hiringDefaults || null;
    }

    const saved = await this.profilesRepo.save(profile);
    await this.logAction(membership.companyId, actor, {
      action: 'company.profile.updated',
      target: saved.displayName,
      metadata: { fields: Object.keys(dto) },
    });
    return { ...(await this.getProfile(actor)), id: saved.id };
  }

  async getTeam(actor: { id: string; email?: string; role?: string }) {
    const membership = await this.companyScope.getMembership(
      actor.id,
      actor.role,
    );
    const [members, invites] = await Promise.all([
      this.membersRepo.find({
        where: { companyId: membership.companyId, isActive: true },
        order: { joinedAt: 'ASC' },
      }),
      this.invitesRepo.find({
        where: { companyId: membership.companyId, status: CompanyInviteStatus.PENDING },
        order: { createdAt: 'DESC' },
      }),
    ]);
    const users = await this.usersService.findByIds(members.map((m) => m.userId));
    const userMap = new Map(users.map((user) => [user.id, user]));

    return {
      currentRole: membership.role,
      members: members.map((member) => {
        const user = userMap.get(member.userId);
        return {
          id: member.id,
          userId: member.userId,
          role: member.role,
          email: user?.email || null,
          firstName: user?.firstName || null,
          lastName: user?.lastName || null,
          avatarUrl: user?.avatarUrl || null,
          joinedAt: member.joinedAt,
        };
      }),
      invites: invites.map((invite) => this.serializeInvite(invite)),
    };
  }

  async inviteMember(
    actor: { id: string; email?: string; role?: string },
    dto: InviteCompanyMemberDto,
  ) {
    const membership = await this.companyScope.assertCompanyAdmin(
      actor.id,
      actor.role,
    );
    const email = dto.email.trim().toLowerCase();
    const role = dto.role || CompanyMemberRole.MEMBER;
    if (role === CompanyMemberRole.OWNER) {
      throw new BadRequestException('Owner role cannot be invited.');
    }

    const existingUser = await this.usersRepo.findOne({ where: { email } });
    if (existingUser) {
      const activeMember = await this.membersRepo.findOne({
        where: {
          companyId: membership.companyId,
          userId: existingUser.id,
          isActive: true,
        },
      });
      if (activeMember) {
        throw new ConflictException('This user is already on the team.');
      }
    }

    const pendingInvite = await this.invitesRepo.findOne({
      where: {
        companyId: membership.companyId,
        email,
        status: CompanyInviteStatus.PENDING,
      },
    });
    if (pendingInvite) {
      throw new ConflictException('An invite is already pending for this email.');
    }

    const { invite, token } = await this.createInviteRecord(
      membership.companyId,
      actor.id,
      email,
      role,
    );
    const savedInvite = await this.deliverInviteEmail(invite, token);
    await this.logAction(membership.companyId, actor, {
      action: 'company.team.invite.created',
      target: email,
      metadata: {
        role,
        emailDeliveryStatus: savedInvite.emailDeliveryStatus,
        emailDeliveryError: savedInvite.emailDeliveryError,
      },
    });

    return {
      ...this.serializeInvite(savedInvite),
      inviteUrl: this.buildInviteUrl(token),
    };
  }

  async resendInvite(
    actor: { id: string; email?: string; role?: string },
    inviteId: string,
  ) {
    const membership = await this.companyScope.assertCompanyAdmin(
      actor.id,
      actor.role,
    );
    const invite = await this.findInvite(membership.companyId, inviteId);
    if (invite.status !== CompanyInviteStatus.PENDING) {
      throw new BadRequestException('Only pending invites can be resent.');
    }

    const token = this.generateInviteToken();
    invite.tokenHash = this.hashSecret(token);
    invite.expiresAt = this.defaultInviteExpiry();
    invite.emailDeliveryStatus = CompanyInviteEmailDeliveryStatus.PENDING;
    invite.emailDeliveryError = null;
    invite.emailSentAt = null;
    invite.emailLastAttemptAt = null;
    const saved = await this.deliverInviteEmail(
      await this.invitesRepo.save(invite),
      token,
    );
    await this.logAction(membership.companyId, actor, {
      action: 'company.team.invite.resent',
      target: saved.email,
      metadata: {
        emailDeliveryStatus: saved.emailDeliveryStatus,
        emailDeliveryError: saved.emailDeliveryError,
      },
    });

    return {
      ...this.serializeInvite(saved),
      inviteUrl: this.buildInviteUrl(token),
    };
  }

  async revokeInvite(
    actor: { id: string; email?: string; role?: string },
    inviteId: string,
  ) {
    const membership = await this.companyScope.assertCompanyAdmin(
      actor.id,
      actor.role,
    );
    const invite = await this.findInvite(membership.companyId, inviteId);
    invite.status = CompanyInviteStatus.REVOKED;
    invite.revokedAt = new Date();
    const saved = await this.invitesRepo.save(invite);
    await this.logAction(membership.companyId, actor, {
      action: 'company.team.invite.revoked',
      target: saved.email,
    });
    return { success: true };
  }

  async previewInvite(token: string) {
    const invite = await this.findInviteByToken(token);
    if (!invite) {
      return {
        valid: false,
        status: 'invalid',
        message: 'Invite link is invalid.',
        passwordRequired: true,
        dashboardPath: '/industry/dashboard',
      };
    }

    const companyName = await this.getCompanyDisplayName(invite.companyId);
    if (
      invite.status === CompanyInviteStatus.PENDING &&
      invite.expiresAt.getTime() <= Date.now()
    ) {
      invite.status = CompanyInviteStatus.EXPIRED;
      await this.invitesRepo.save(invite);
    }

    const existingUser = await this.usersService.findByEmail(invite.email);
    const status = invite.status;
    const valid = status === CompanyInviteStatus.PENDING;
    const requiresTwoFactor = Boolean(
      valid && existingUser?.isTwoFactorEnabled && existingUser.twoFactorSecret,
    );

    return {
      valid,
      status,
      message: this.getInvitePreviewMessage(status),
      companyId: invite.companyId,
      companyName,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
      requiresAccountSetup: valid ? !existingUser : false,
      passwordRequired: true,
      requiresTwoFactor,
      dashboardPath: '/industry/dashboard',
    };
  }

  async acceptInvite(dto: AcceptCompanyInviteDto) {
    const invite = await this.findInviteByToken(dto.token);
    if (!invite || invite.status !== CompanyInviteStatus.PENDING) {
      throw new BadRequestException('Invite link is invalid.');
    }
    if (invite.expiresAt.getTime() <= Date.now()) {
      invite.status = CompanyInviteStatus.EXPIRED;
      await this.invitesRepo.save(invite);
      throw new BadRequestException('Invite link has expired.');
    }

    const password = dto.password || '';
    if (!password) {
      throw new BadRequestException('Password is required to accept invite.');
    }

    let user = await this.usersService.findByEmail(invite.email);
    if (!user) {
      this.assertStrongInvitePassword(password);
      user = await this.usersService.create(
        invite.email,
        password,
        UserRole.COMPANY_ADMIN,
        dto.firstName || invite.email.split('@')[0],
        dto.lastName || '',
      );
    } else {
      if (user.isActive === false) {
        throw new BadRequestException('This account is disabled.');
      }
      const validPassword = await this.usersService.validatePassword(
        password,
        user.password,
      );
      if (!validPassword) {
        throw new BadRequestException('Password is incorrect.');
      }
      if (user.isTwoFactorEnabled && user.twoFactorSecret) {
        const twoFactorCode = (dto.twoFactorCode || '').replace(/\s+/g, '');
        if (!twoFactorCode) {
          throw new BadRequestException('Two-factor code is required.');
        }
        const validTwoFactor = await this.usersService.verifyTwoFactorCode(
          user.id,
          twoFactorCode,
        );
        if (!validTwoFactor) {
          throw new BadRequestException('Invalid two-factor code.');
        }
      }
      if (user.role !== UserRole.COMPANY_ADMIN) {
        user = await this.usersService.setRole(user.id, UserRole.COMPANY_ADMIN);
      }
    }

    let member = await this.membersRepo.findOne({
      where: { companyId: invite.companyId, userId: user.id },
    });
    if (!member) {
      member = this.membersRepo.create({
        companyId: invite.companyId,
        userId: user.id,
        role: invite.role,
        isActive: true,
        leftAt: null,
      });
    } else {
      member.role = invite.role;
      member.isActive = true;
      member.leftAt = null;
    }
    member = await this.membersRepo.save(member);

    invite.status = CompanyInviteStatus.ACCEPTED;
    invite.acceptedAt = new Date();
    invite.acceptedByUserId = user.id;
    await this.invitesRepo.save(invite);
    await this.logAction(invite.companyId, { id: user.id, email: user.email }, {
      action: 'company.team.invite.accepted',
      target: user.email,
      metadata: {
        role: member.role,
        userId: user.id,
        companyId: invite.companyId,
      },
    });
    const session = await this.authService.issueAccessTokenForUser(user);

    return {
      success: true,
      accessToken: session.accessToken,
      user: session.user,
      companyId: invite.companyId,
      membershipRole: member.role,
      dashboardPath: '/industry/dashboard',
    };
  }

  async updateMember(
    actor: { id: string; email?: string; role?: string },
    memberId: string,
    dto: UpdateCompanyMemberDto,
  ) {
    const membership = await this.companyScope.assertCompanyAdmin(
      actor.id,
      actor.role,
    );
    const member = await this.findMember(membership.companyId, memberId);
    if (member.role === CompanyMemberRole.OWNER) {
      throw new BadRequestException('Owner role cannot be changed.');
    }
    member.role = dto.role;
    const saved = await this.membersRepo.save(member);
    await this.logAction(membership.companyId, actor, {
      action: 'company.team.member.updated',
      target: saved.userId,
      metadata: { role: saved.role },
    });
    return saved;
  }

  async removeMember(
    actor: { id: string; email?: string; role?: string },
    memberId: string,
  ) {
    const membership = await this.companyScope.assertCompanyAdmin(
      actor.id,
      actor.role,
    );
    const member = await this.findMember(membership.companyId, memberId);
    if (member.role === CompanyMemberRole.OWNER) {
      throw new BadRequestException('Owner cannot be removed.');
    }
    member.isActive = false;
    member.leftAt = new Date();
    await this.membersRepo.save(member);
    await this.logAction(membership.companyId, actor, {
      action: 'company.team.member.removed',
      target: member.userId,
    });
    return { success: true };
  }

  async getBilling(actor: { id: string; email?: string; role?: string }) {
    const membership = await this.companyScope.getMembership(
      actor.id,
      actor.role,
    );
    const [profile, orders, usage] = await Promise.all([
      this.getProfileForCompany(membership.companyId),
      this.billingRepo.find({
        where: { companyId: membership.companyId, status: 'paid' },
        order: { paidAt: 'DESC', createdAt: 'DESC' },
        take: 25,
      }),
      this.getUsageSnapshot(membership.companyId),
    ]);
    profile.usageSnapshot = usage;
    await this.profilesRepo.save(profile);

    return {
      plan: profile.subscriptionPlan,
      status: profile.subscriptionStatus,
      billingStartedAt: profile.billingStartedAt,
      subscriptionEndDate: profile.subscriptionEndDate,
      usage,
      invoices: orders.map((order) => ({
        id: order.id,
        plan: order.plan,
        amountInPaise: order.amountInPaise,
        amount: Number((order.amountInPaise / 100).toFixed(2)),
        currency: order.currency,
        paymentId: order.paymentId,
        orderId: order.providerOrderId,
        status: order.status,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
      })),
    };
  }

  async createBillingOrder(
    actor: { id: string; email?: string; role?: string },
    dto: CreateCompanyBillingOrderDto,
  ) {
    const membership = await this.companyScope.assertCompanyAdmin(
      actor.id,
      actor.role,
    );
    if (dto.plan !== COMPANY_PRO_PLAN) {
      throw new BadRequestException('Unsupported company plan.');
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new ForbiddenException('Payment provider is not configured.');
    }

    const amountInPaise = this.getCompanyPlanPriceInPaise();
    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await axios.post(
      'https://api.razorpay.com/v1/orders',
      {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `company_${membership.companyId.slice(0, 8)}_${Date.now()}`,
      },
      {
        headers: { Authorization: `Basic ${authHeader}` },
      },
    );
    const providerOrderId: string | undefined = response?.data?.id;
    if (!providerOrderId) {
      throw new BadRequestException('Unable to create payment order.');
    }

    const order = this.billingRepo.create({
      companyId: membership.companyId,
      userId: actor.id,
      plan: dto.plan,
      amountInPaise,
      currency: 'INR',
      providerOrderId,
      paymentId: null,
      status: 'created',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      paidAt: null,
    });
    await this.billingRepo.save(order);
    await this.logAction(membership.companyId, actor, {
      action: 'company.billing.order.created',
      target: dto.plan,
      metadata: { amountInPaise },
    });

    return {
      orderId: providerOrderId,
      amount: amountInPaise,
      currency: 'INR',
      plan: dto.plan,
    };
  }

  async verifyBilling(
    actor: { id: string; email?: string; role?: string },
    dto: VerifyCompanyBillingDto,
  ) {
    const membership = await this.companyScope.assertCompanyAdmin(
      actor.id,
      actor.role,
    );
    if (dto.plan !== COMPANY_PRO_PLAN) {
      throw new BadRequestException('Unsupported company plan.');
    }
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new ForbiddenException('Payment verification is not configured.');
    }
    const expected = createHmac('sha256', secret)
      .update(`${dto.orderId}|${dto.paymentId}`)
      .digest('hex');
    if (expected !== dto.signature) {
      throw new BadRequestException('Invalid payment signature.');
    }

    const order = await this.billingRepo.findOne({
      where: { companyId: membership.companyId, providerOrderId: dto.orderId },
    });
    if (!order) {
      throw new BadRequestException('Payment order not found.');
    }
    if (
      order.expiresAt &&
      order.expiresAt.getTime() <= Date.now() &&
      order.status !== 'paid'
    ) {
      order.status = 'expired';
      await this.billingRepo.save(order);
      throw new BadRequestException('Payment order expired.');
    }
    if (order.status === 'paid') {
      return this.getBilling(actor);
    }

    const now = new Date();
    order.status = 'paid';
    order.paymentId = dto.paymentId;
    order.paidAt = now;
    await this.billingRepo.save(order);

    const profile = await this.getProfileForCompany(membership.companyId);
    const startMs =
      profile.subscriptionStatus === 'active' &&
      profile.subscriptionEndDate &&
      profile.subscriptionEndDate.getTime() > now.getTime()
        ? profile.subscriptionEndDate.getTime()
        : now.getTime();
    profile.subscriptionPlan = 'company_pro';
    profile.subscriptionStatus = 'active';
    profile.billingStartedAt = profile.billingStartedAt || now;
    profile.subscriptionEndDate = new Date(startMs + 30 * 24 * 60 * 60 * 1000);
    await this.profilesRepo.save(profile);
    await this.logAction(membership.companyId, actor, {
      action: 'company.billing.payment.verified',
      target: dto.paymentId,
      metadata: { plan: dto.plan },
    });

    return this.getBilling(actor);
  }

  async listApiKeys(actor: { id: string; email?: string; role?: string }) {
    const membership = await this.companyScope.assertCompanyAdmin(
      actor.id,
      actor.role,
    );
    const keys = await this.apiKeysRepo.find({
      where: { companyId: membership.companyId },
      order: { createdAt: 'DESC' },
    });
    return keys.map((key) => this.serializeApiKey(key));
  }

  async createApiKey(
    actor: { id: string; email?: string; role?: string },
    dto: CreateCompanyApiKeyDto,
  ) {
    const membership = await this.companyScope.assertCompanyAdmin(
      actor.id,
      actor.role,
    );
    if (!dto.scopes?.length) {
      throw new BadRequestException('At least one API scope is required.');
    }
    const invalid = dto.scopes.find(
      (scope) => !COMPANY_API_KEY_SCOPES.includes(scope as any),
    );
    if (invalid) {
      throw new BadRequestException(`Unsupported API scope: ${invalid}`);
    }

    const prefix = `ek_${randomBytes(5).toString('hex')}`;
    const secret = randomBytes(24).toString('base64url');
    const key = `${prefix}_${secret}`;
    const row = this.apiKeysRepo.create({
      companyId: membership.companyId,
      name: dto.name.trim(),
      prefix,
      keyHash: this.hashSecret(key),
      scopes: dto.scopes,
      createdByUserId: actor.id,
      lastUsedAt: null,
      revokedAt: null,
    });
    const saved = await this.apiKeysRepo.save(row);
    await this.logAction(membership.companyId, actor, {
      action: 'company.api_key.created',
      target: saved.name,
      metadata: { scopes: saved.scopes, prefix: saved.prefix },
    });
    return { ...this.serializeApiKey(saved), key };
  }

  async revokeApiKey(
    actor: { id: string; email?: string; role?: string },
    keyId: string,
  ) {
    const membership = await this.companyScope.assertCompanyAdmin(
      actor.id,
      actor.role,
    );
    const key = await this.apiKeysRepo.findOne({
      where: { id: keyId, companyId: membership.companyId },
    });
    if (!key) throw new NotFoundException('API key not found.');
    key.revokedAt = key.revokedAt || new Date();
    await this.apiKeysRepo.save(key);
    await this.logAction(membership.companyId, actor, {
      action: 'company.api_key.revoked',
      target: key.name,
      severity: 'warning',
      metadata: { prefix: key.prefix },
    });
    return { success: true };
  }

  async listAuditLog(actor: { id: string; email?: string; role?: string }) {
    const membership = await this.companyScope.getMembership(
      actor.id,
      actor.role,
    );
    return this.auditRepo.find({
      where: { companyId: membership.companyId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async deactivateAccount(
    actor: { id: string; email?: string; role?: string },
    dto: DeactivateCompanyAccountDto,
  ) {
    const membership = await this.companyScope.assertCompanyOwner(
      actor.id,
      actor.role,
    );
    const user = await this.usersService.findById(actor.id);
    const userWithPassword = await this.usersService.findByEmail(user.email);
    if (!userWithPassword) throw new NotFoundException('User not found.');
    const valid = await this.usersService.validatePassword(
      dto.password,
      userWithPassword.password,
    );
    if (!valid) throw new BadRequestException('Password is incorrect.');

    const profile = await this.getProfileForCompany(membership.companyId);
    profile.isActive = false;
    await this.profilesRepo.save(profile);
    await this.usersService.update(actor.id, { isActive: false } as any);
    await this.logAction(membership.companyId, actor, {
      action: 'company.account.deactivated',
      target: profile.displayName,
      severity: 'critical',
    });
    return { success: true };
  }

  async logAction(
    companyId: string,
    actor: { id?: string | null; email?: string | null },
    payload: {
      action: string;
      target?: string | null;
      severity?: 'info' | 'warning' | 'critical';
      metadata?: Record<string, any> | null;
    },
  ) {
    const log = this.auditRepo.create({
      companyId,
      actorId: actor.id || null,
      actorEmail: actor.email || null,
      action: payload.action,
      target: payload.target || null,
      severity: payload.severity || 'info',
      metadata: payload.metadata || null,
    });
    try {
      return await this.auditRepo.save(log);
    } catch {
      return null;
    }
  }

  private async findInvite(companyId: string, inviteId: string) {
    const invite = await this.invitesRepo.findOne({ where: { id: inviteId, companyId } });
    if (!invite) throw new NotFoundException('Invite not found.');
    return invite;
  }

  private async findInviteByToken(token: string) {
    const normalizedToken = String(token || '').trim();
    if (!normalizedToken) return null;
    return this.invitesRepo.findOne({
      where: { tokenHash: this.hashSecret(normalizedToken) },
    });
  }

  private async findMember(companyId: string, memberId: string) {
    const member = await this.membersRepo.findOne({
      where: { id: memberId, companyId, isActive: true },
    });
    if (!member) throw new NotFoundException('Team member not found.');
    return member;
  }

  private async createInviteRecord(
    companyId: string,
    actorId: string,
    email: string,
    role: CompanyMemberRole,
  ) {
    const token = this.generateInviteToken();
    const invite = this.invitesRepo.create({
      companyId,
      email,
      role,
      tokenHash: this.hashSecret(token),
      status: CompanyInviteStatus.PENDING,
      invitedByUserId: actorId,
      acceptedByUserId: null,
      expiresAt: this.defaultInviteExpiry(),
      acceptedAt: null,
      revokedAt: null,
      emailDeliveryStatus: CompanyInviteEmailDeliveryStatus.PENDING,
      emailDeliveryError: null,
      emailSentAt: null,
      emailLastAttemptAt: null,
    });
    return { invite: await this.invitesRepo.save(invite), token };
  }

  private async getRepositoryTechContext(companyId: string) {
    const repos = await this.githubRepo.find({
      where: { companyId, isLinked: true },
      order: { contextSyncedAt: 'DESC', updatedAt: 'DESC' },
      take: 20,
    });
    const parsed = repos.filter((repo) => repo.contextStatus === 'parsed');
    const languages = new Set<string>();
    const frameworks = new Set<string>();
    const infrastructure = new Set<string>();
    const architecturePatterns = new Set<string>();

    for (const repo of parsed) {
      const snapshot = repo.contextSnapshot || {};
      const rawLanguages = snapshot.languages || snapshot.languageSummary;
      if (rawLanguages && typeof rawLanguages === 'object') {
        Object.keys(rawLanguages).forEach((language) => languages.add(language));
      }
      const intelligence = snapshot.repoIntelligence || {};
      this.asArray(intelligence.roleRelevantSkills).forEach((item) =>
        frameworks.add(item),
      );
      this.asArray(intelligence.architectureHints).forEach((item) =>
        architecturePatterns.add(item),
      );
      this.asArray(intelligence.importantFiles).forEach((item) => {
        if (/docker|kubernetes|terraform|vercel|netlify|aws|azure/i.test(item)) {
          infrastructure.add(item);
        }
      });
    }

    return {
      repositoryCount: repos.length,
      parsedCount: parsed.length,
      languages: Array.from(languages).slice(0, 12),
      frameworks: Array.from(frameworks).slice(0, 12),
      infrastructure: Array.from(infrastructure).slice(0, 12),
      architecturePatterns: Array.from(architecturePatterns).slice(0, 12),
      repositories: parsed.slice(0, 5).map((repo) => ({
        id: repo.id,
        fullName: repo.fullName,
        contextSyncedAt: repo.contextSyncedAt,
      })),
    };
  }

  private async getUsageSnapshot(companyId: string) {
    const placements = await this.placementsRepo.find({
      where: { companyId },
      select: ['id'],
    });
    const placementIds = placements.map((placement) => placement.id);
    const [roles, assessments, linkedRepos, applications] = await Promise.all([
      Promise.resolve(placements.length),
      this.assessmentsRepo.count({ where: { companyId } }),
      this.githubRepo.count({ where: { companyId, isLinked: true } }),
      placementIds.length
        ? this.applicationsRepo.count({ where: { placementId: In(placementIds) } })
        : Promise.resolve(0),
    ]);
    return { roles, assessments, linkedRepos, candidates: applications };
  }

  private async sendInviteEmail(invite: CompanyInvite, token: string) {
    const inviteUrl = this.buildInviteUrl(token);
    const companyName = await this.getCompanyDisplayName(invite.companyId);
    const roleLabel =
      invite.role === CompanyMemberRole.ADMIN ? 'Admin access' : 'Member access';
    const safeCompanyName = this.escapeHtml(companyName);
    const safeRoleLabel = this.escapeHtml(roleLabel);
    const safeInviteUrl = this.escapeHtml(inviteUrl);
    return this.emailService.sendTransactionalEmail({
      to: invite.email,
      subject: `${companyName} invited you to access Emble`,
      plainText: [
        `${companyName} invited you to access the Emble company dashboard.`,
        `Access level: ${roleLabel}.`,
        `Access company dashboard: ${inviteUrl}`,
        `This invite expires on ${invite.expiresAt.toISOString()}.`,
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
          <p>${safeCompanyName} invited you to access the Emble company dashboard.</p>
          <p><strong>${safeRoleLabel}</strong></p>
          <p>
            <a href="${safeInviteUrl}" style="display:inline-block;background:#042614;color:#ffffff;padding:12px 16px;border-radius:8px;text-decoration:none;font-weight:700">
              Access company dashboard
            </a>
          </p>
          <p style="color:#6b7280;font-size:13px">This invite expires on ${this.escapeHtml(invite.expiresAt.toISOString())}.</p>
        </div>
      `,
    });
  }

  private async deliverInviteEmail(invite: CompanyInvite, token: string) {
    const attemptedAt = new Date();
    try {
      const delivery = await this.sendInviteEmail(invite, token);
      invite.emailDeliveryStatus =
        delivery.status === 'sent'
          ? CompanyInviteEmailDeliveryStatus.SENT
          : CompanyInviteEmailDeliveryStatus.FAILED;
      invite.emailDeliveryError =
        delivery.status === 'sent'
          ? null
          : delivery.error || 'Email delivery failed.';
      invite.emailSentAt =
        delivery.status === 'sent' ? attemptedAt : invite.emailSentAt || null;
    } catch (error) {
      invite.emailDeliveryStatus = CompanyInviteEmailDeliveryStatus.FAILED;
      invite.emailDeliveryError =
        error instanceof Error ? error.message : 'Email delivery failed.';
    }
    invite.emailLastAttemptAt = attemptedAt;
    return this.invitesRepo.save(invite);
  }

  private async getCompanyDisplayName(companyId: string) {
    const profile = await this.profilesRepo.findOne({ where: { companyId } });
    return (
      profile?.displayName ||
      profile?.legalName ||
      'Emble company workspace'
    );
  }

  private getInvitePreviewMessage(status: CompanyInviteStatus | 'invalid') {
    if (status === CompanyInviteStatus.PENDING) return 'Invite is ready.';
    if (status === CompanyInviteStatus.ACCEPTED) {
      return 'This invite has already been accepted.';
    }
    if (status === CompanyInviteStatus.EXPIRED) {
      return 'This invite has expired. Ask the company to resend it.';
    }
    if (status === CompanyInviteStatus.REVOKED) {
      return 'This invite was revoked. Ask the company for a new invite.';
    }
    return 'Invite link is invalid.';
  }

  private assertStrongInvitePassword(password: string) {
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)
    ) {
      throw new BadRequestException(
        'Password must include uppercase, lowercase, number, and symbol.',
      );
    }
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private buildInviteUrl(token: string) {
    const base = (process.env.FRONTEND_URL || 'http://localhost:4000')
      .split(',')[0]
      .trim()
      .replace(/\/$/, '');
    return `${base}/industry/invite?token=${encodeURIComponent(token)}`;
  }

  private serializeInvite(invite: CompanyInvite) {
    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      emailDeliveryStatus:
        invite.emailDeliveryStatus || CompanyInviteEmailDeliveryStatus.PENDING,
      emailDeliveryError: invite.emailDeliveryError || null,
      emailSentAt: invite.emailSentAt || null,
      emailLastAttemptAt: invite.emailLastAttemptAt || null,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
    };
  }

  private serializeApiKey(key: CompanyApiKey) {
    return {
      id: key.id,
      name: key.name,
      prefix: key.prefix,
      scopes: key.scopes,
      lastUsedAt: key.lastUsedAt,
      revokedAt: key.revokedAt,
      createdAt: key.createdAt,
    };
  }

  private normalizeSlug(value: string) {
    const slug = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 140);
    if (!slug) throw new BadRequestException('Slug is required.');
    return slug;
  }

  private emptyToNull(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private hashSecret(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private generateInviteToken() {
    return randomBytes(32).toString('base64url');
  }

  private defaultInviteExpiry() {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  private getCompanyPlanPriceInPaise() {
    const configured = Number(process.env.COMPANY_PRO_MONTHLY_PRICE_INR);
    if (Number.isFinite(configured) && configured > 0) {
      return Math.round(configured * 100);
    }
    return COMPANY_PRO_PRICE_IN_PAISE;
  }

  private asArray(value: unknown) {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .slice(0, 20);
  }
}
