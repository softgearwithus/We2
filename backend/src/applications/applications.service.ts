import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import {
  DriveVerificationStatus,
  Placement,
  PlacementStatus,
} from '../placements/entities/placement.entity';
import { UserRole } from '../users/user.entity';
import { ApplicationStatus } from './entities/application.entity';

@Injectable()
export class ApplicationsService {
  private static readonly RESUME_ACCESS_ERROR =
    'Resume link must be accessible to anyone with the link.';

  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(Placement)
    private placementsRepository: Repository<Placement>,
  ) {}

  private normalizeOptionalValue(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private parseGoogleDriveResumeUrl(rawUrl: string): {
    parsedUrl: URL;
    resourceId: string;
  } {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(rawUrl.trim());
    } catch {
      throw new BadRequestException('Resume link must be a valid URL.');
    }

    if (parsedUrl.protocol !== 'https:') {
      throw new BadRequestException('Resume link must start with https://.');
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname !== 'drive.google.com') {
      throw new BadRequestException(
        'Resume link must use the drive.google.com domain.',
      );
    }

    const fileMatch = parsedUrl.pathname.match(/^\/file\/d\/([^/]+)/);
    if (fileMatch?.[1]) {
      return {
        parsedUrl,
        resourceId: fileMatch[1],
      };
    }

    const sharedId = parsedUrl.searchParams.get('id');
    if (
      sharedId &&
      (parsedUrl.pathname === '/open' || parsedUrl.pathname === '/uc')
    ) {
      return {
        parsedUrl,
        resourceId: sharedId,
      };
    }

    throw new BadRequestException(
      'Resume link must be a valid public Google Drive file URL.',
    );
  }

  private async assertPublicResumeLink(resourceId: string) {
    const probeUrl = `https://drive.google.com/uc?export=download&id=${resourceId}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(probeUrl, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          Accept: '*/*',
          'User-Agent': 'EmbleResumeValidator/1.0',
        },
      });

      const finalUrl = response.url.toLowerCase();
      if (
        finalUrl.includes('accounts.google.com') ||
        finalUrl.includes('servicelogin')
      ) {
        throw new BadRequestException(
          ApplicationsService.RESUME_ACCESS_ERROR,
        );
      }

      if (!response.ok) {
        throw new BadRequestException(
          ApplicationsService.RESUME_ACCESS_ERROR,
        );
      }

      const contentType =
        response.headers.get('content-type')?.toLowerCase() || '';
      if (
        !contentType.includes('text/html') &&
        !contentType.includes('text/plain')
      ) {
        return;
      }

      const body = (await response.text()).slice(0, 8000).toLowerCase();
      const restrictedMarkers = [
        'you need access',
        'request access',
        'sign in',
        'access denied',
        'unable to open the file at this time',
        'file does not exist',
        'document is not published',
        'quota exceeded',
      ];

      if (restrictedMarkers.some((marker) => body.includes(marker))) {
        throw new BadRequestException(
          ApplicationsService.RESUME_ACCESS_ERROR,
        );
      }

      const publicMarkers = [
        'google drive',
        'google docs',
        'download anyway',
        'virus scan warning',
        'open with google docs',
      ];

      if (!publicMarkers.some((marker) => body.includes(marker))) {
        throw new BadRequestException(
          'Resume link could not be verified as public. Please recheck the Google Drive sharing settings.',
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new BadRequestException(
          'Resume link validation timed out. Please try again with a valid public Google Drive link.',
        );
      }

      throw new BadRequestException(
        'Unable to validate the resume link right now. Please try again.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  async apply(studentId: string, createDto: CreateApplicationDto) {
    const placement = await this.placementsRepository.findOne({
      where: { id: createDto.placementId },
    });
    if (!placement) {
      throw new NotFoundException('Placement drive not found.');
    }

    if (
      placement.verificationStatus !== DriveVerificationStatus.APPROVED ||
      placement.status !== PlacementStatus.ACTIVE
    ) {
      throw new ForbiddenException(
        'Applications are open only for approved active drives.',
      );
    }

    // Prevent duplicate applications
    const existing = await this.applicationsRepository.findOne({
      where: { studentId, placementId: createDto.placementId },
    });
    if (existing)
      throw new ConflictException('You have already applied to this drive.');

    const { parsedUrl, resourceId } = this.parseGoogleDriveResumeUrl(
      createDto.resumeDriveUrl,
    );
    await this.assertPublicResumeLink(resourceId);

    const app = this.applicationsRepository.create({
      studentId,
      placementId: createDto.placementId,
      candidateName: createDto.candidateName.trim(),
      candidateEmail: createDto.candidateEmail.trim().toLowerCase(),
      candidatePhone: createDto.candidatePhone.trim(),
      candidateDepartment: this.normalizeOptionalValue(
        createDto.candidateDepartment,
      ),
      candidateYear: this.normalizeOptionalValue(createDto.candidateYear),
      candidateLocation: this.normalizeOptionalValue(
        createDto.candidateLocation,
      ),
      candidateLinkedinUrl: this.normalizeOptionalValue(
        createDto.candidateLinkedinUrl,
      ),
      resumeDriveUrl: parsedUrl.toString(),
    });
    return this.applicationsRepository.save(app);
  }

  // For companies: View all applicants to a specific drive they own
  async findByPlacement(
    placementId: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    // Enforce company ownership
    const placement = await this.placementsRepository.findOne({
      where: { id: placementId },
    });
    if (!placement) throw new NotFoundException('Drive not found');
    if (actorRole === UserRole.COMPANY_ADMIN && placement.companyId !== actorId)
      throw new ForbiddenException('Access denied. You do not own this drive.');

    return this.applicationsRepository.find({
      where: { placementId },
      relations: ['student'],
      order: { appliedAt: 'DESC' },
    });
  }

  // ATS: update applicant status
  async updateStatus(
    id: string,
    status: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['placement'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (
      actorRole === UserRole.COMPANY_ADMIN &&
      application.placement?.companyId !== actorId
    ) {
      throw new ForbiddenException(
        'Access denied. You do not own this drive application.',
      );
    }

    const nextStatus = status as ApplicationStatus;
    if (!Object.values(ApplicationStatus).includes(nextStatus)) {
      throw new ForbiddenException('Invalid application status value.');
    }

    application.status = nextStatus;
    return this.applicationsRepository.save(application);
  }
}
