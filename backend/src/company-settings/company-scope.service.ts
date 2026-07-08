import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { CompanyMember, CompanyMemberRole } from './entities/company-member.entity';
import { CompanyProfile } from './entities/company-profile.entity';

@Injectable()
export class CompanyScopeService {
  constructor(
    @InjectRepository(CompanyMember)
    private readonly membersRepo: Repository<CompanyMember>,
    @InjectRepository(CompanyProfile)
    private readonly profilesRepo: Repository<CompanyProfile>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async resolveCompanyId(actorId: string, actorRole?: string) {
    if (actorRole !== UserRole.COMPANY_ADMIN) {
      return actorId;
    }

    const membership = await this.membersRepo.findOne({
      where: { userId: actorId, isActive: true },
      order: { joinedAt: 'ASC' },
    });

    if (membership) {
      return membership.companyId;
    }

    await this.ensureOwnerWorkspace(actorId);
    return actorId;
  }

  async getMembership(actorId: string, actorRole?: string) {
    const companyId = await this.resolveCompanyId(actorId, actorRole);
    const membership = await this.membersRepo.findOne({
      where: { companyId, userId: actorId, isActive: true },
    });

    if (membership) return membership;

    if (actorRole === UserRole.COMPANY_ADMIN && companyId === actorId) {
      return this.ensureOwnerWorkspace(actorId);
    }

    throw new ForbiddenException('You are not a member of this company.');
  }

  async assertCompanyAdmin(actorId: string, actorRole?: string) {
    const membership = await this.getMembership(actorId, actorRole);
    if (
      ![CompanyMemberRole.OWNER, CompanyMemberRole.ADMIN].includes(
        membership.role,
      )
    ) {
      throw new ForbiddenException('Company admin access required.');
    }
    return membership;
  }

  async assertCompanyOwner(actorId: string, actorRole?: string) {
    const membership = await this.getMembership(actorId, actorRole);
    if (membership.role !== CompanyMemberRole.OWNER) {
      throw new ForbiddenException('Company owner access required.');
    }
    return membership;
  }

  async ensureOwnerWorkspace(companyId: string) {
    const user = await this.usersRepo.findOne({ where: { id: companyId } });
    if (!user) {
      throw new NotFoundException('Company owner account not found.');
    }

    let profile = await this.profilesRepo.findOne({ where: { companyId } });
    if (!profile) {
      const displayName =
        [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
        user.email.split('@')[0] ||
        'Company workspace';
      profile = this.profilesRepo.create({
        companyId,
        displayName,
        legalName: null,
        slug: this.buildSlug(displayName, companyId),
        website: user.websiteUrl || null,
        supportEmail: user.email,
        verificationEmail: user.email,
        logoUrl: user.avatarUrl || null,
        description: user.bio || null,
        industry: null,
        productType: null,
        domain: null,
        companyContext: null,
        hiringDefaults: null,
        subscriptionPlan: user.subscriptionPlan || 'free',
        subscriptionStatus: user.subscriptionStatus || 'inactive',
        subscriptionEndDate: user.subscriptionEndDate || null,
        billingStartedAt: user.usageLastReset || null,
        usageSnapshot: null,
        isActive: user.isActive !== false,
      });
      profile = await this.profilesRepo.save(profile);
    }

    let owner = await this.membersRepo.findOne({
      where: { companyId, userId: companyId },
    });
    if (!owner) {
      owner = this.membersRepo.create({
        companyId,
        userId: companyId,
        role: CompanyMemberRole.OWNER,
        isActive: true,
        leftAt: null,
      });
      owner = await this.membersRepo.save(owner);
    } else if (!owner.isActive || owner.role !== CompanyMemberRole.OWNER) {
      owner.isActive = true;
      owner.leftAt = null;
      owner.role = CompanyMemberRole.OWNER;
      owner = await this.membersRepo.save(owner);
    }

    return owner;
  }

  private buildSlug(value: string, companyId: string) {
    const base =
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 72) || 'company';
    return `${base}-${companyId.slice(0, 8)}`;
  }
}
