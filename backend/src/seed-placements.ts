import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  Placement,
  PlacementStatus,
  PlacementType,
  WorkMode,
} from './placements/entities/placement.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const placementRepo = app.get<Repository<Placement>>(
    getRepositoryToken(Placement),
  );

  // Seed logic safely appends rather than deleting
  console.log('Seeding mock Placement Drives...');

  const mockDrives = [
    {
      title: 'SDE-1 Frontend Engineer',
      jobProfile: 'Frontend Engineer',
      companyName: 'TechCorp India',
      type: PlacementType.FULL_TIME,
      workMode: WorkMode.HYBRID,
      status: PlacementStatus.ACTIVE,
      description: 'Looking for highly motivated React developers.',
      applyLink: 'https://forms.gle/mock1',
      packageOffered: '8 - 12 LPA',
      roles: ['Frontend Development', 'Component Design'],
      skillsRequired: ['React', 'TypeScript', 'REST APIs'],
      batchEligible: '2025',
      salaryRange: '8 - 12 LPA',
      location: 'Bangalore / Hybrid',
      companyLogo: 'https://logo.clearbit.com/tcs.com',
    },
    {
      title: 'Summer Intern - NextJS',
      jobProfile: 'Frontend Intern',
      companyName: 'StartupX',
      type: PlacementType.INTERNSHIP,
      workMode: WorkMode.REMOTE,
      status: PlacementStatus.ACTIVE,
      description: '3-month intensive internship on modern web stacks.',
      applyLink: 'https://forms.gle/mock2',
      packageOffered: '25k / month stipend',
      roles: ['Frontend Development', 'Testing'],
      skillsRequired: ['Next.js', 'React', 'Git'],
      batchEligible: '2026',
      salaryRange: '25k / month stipend',
      location: 'Remote',
      companyLogo: 'https://logo.clearbit.com/ycombinator.com',
    },
    {
      title: 'DevOps Engineer (Junior)',
      jobProfile: 'DevOps Engineer',
      companyName: 'CloudSolutions',
      type: PlacementType.REMOTE,
      workMode: WorkMode.REMOTE,
      status: PlacementStatus.ACTIVE,
      description: 'Manage AWS infrastructure and CI/CD pipelines.',
      applyLink: 'https://forms.gle/mock3',
      packageOffered: '10 - 15 LPA',
      roles: ['Infrastructure Management', 'CI/CD'],
      skillsRequired: ['AWS', 'Docker', 'Kubernetes'],
      batchEligible: '2024, 2025',
      salaryRange: '10 - 15 LPA',
      location: 'Fully Remote',
      companyLogo: 'https://logo.clearbit.com/aws.amazon.com',
    },
    {
      title: 'Backend Developer Intern',
      jobProfile: 'Backend Intern',
      companyName: 'DataStacks',
      type: PlacementType.INTERNSHIP,
      workMode: WorkMode.OFFLINE,
      status: PlacementStatus.UPCOMING,
      description: 'Build robust APIs in Node.js and NestJS.',
      applyLink: 'https://forms.gle/mock4',
      packageOffered: '30k / month stipend',
      roles: ['API Development', 'Database Design'],
      skillsRequired: ['Node.js', 'NestJS', 'PostgreSQL'],
      batchEligible: '2026',
      salaryRange: '30k / month stipend',
      location: 'Gurgaon',
      companyLogo: 'https://logo.clearbit.com/mongodb.com',
    },
  ];

  console.log('Seeding mock Placement Drives...');
  for (const drive of mockDrives) {
    const entity = placementRepo.create(drive);
    await placementRepo.save(entity);
  }

  console.log('✅ Successfully seeded Placement Drives!');
  await app.close();
}

bootstrap().catch(console.error);
