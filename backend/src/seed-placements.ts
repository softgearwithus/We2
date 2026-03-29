import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  Placement,
  PlacementStatus,
  PlacementType,
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
      companyName: 'TechCorp India',
      type: PlacementType.FULL_TIME,
      status: PlacementStatus.ACTIVE,
      description: 'Looking for highly motivated React developers.',
      applyLink: 'https://forms.gle/mock1',
      batchEligible: '2025',
      salaryRange: '8 - 12 LPA',
      location: 'Bangalore / Hybrid',
      companyLogo: 'https://logo.clearbit.com/tcs.com',
    },
    {
      title: 'Summer Intern - NextJS',
      companyName: 'StartupX',
      type: PlacementType.INTERNSHIP,
      status: PlacementStatus.ACTIVE,
      description: '3-month intensive internship on modern web stacks.',
      applyLink: 'https://forms.gle/mock2',
      batchEligible: '2026',
      salaryRange: '25k / month stipend',
      location: 'Remote',
      companyLogo: 'https://logo.clearbit.com/ycombinator.com',
    },
    {
      title: 'DevOps Engineer (Junior)',
      companyName: 'CloudSolutions',
      type: PlacementType.REMOTE,
      status: PlacementStatus.ACTIVE,
      description: 'Manage AWS infrastructure and CI/CD pipelines.',
      applyLink: 'https://forms.gle/mock3',
      batchEligible: '2024, 2025',
      salaryRange: '10 - 15 LPA',
      location: 'Fully Remote',
      companyLogo: 'https://logo.clearbit.com/aws.amazon.com',
    },
    {
      title: 'Backend Developer Intern',
      companyName: 'DataStacks',
      type: PlacementType.INTERNSHIP,
      status: PlacementStatus.UPCOMING,
      description: 'Build robust APIs in Node.js and NestJS.',
      applyLink: 'https://forms.gle/mock4',
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
