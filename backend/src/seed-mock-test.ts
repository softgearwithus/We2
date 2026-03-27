import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Company } from './users/../test-series/entities/company.entity';
import { MockTest } from './users/../test-series/entities/mock-test.entity';
import { MockTestSection } from './users/../test-series/entities/mock-test-section.entity';
import {
  MockTestQuestion,
  MockQuestionType,
} from './users/../test-series/entities/mock-test-question.entity';
import { resolveDbConfig } from './common/db-config';

dotenv.config({ path: '.env.development' });

const AppDataSource = new DataSource({
  type: 'postgres',
  ...resolveDbConfig(),
  entities: [Company, MockTest, MockTestSection, MockTestQuestion],
  synchronize: false,
});

async function run() {
  await AppDataSource.initialize();

  // Get any active company
  const companyRepo = AppDataSource.getRepository(Company);
  let company = await companyRepo.findOne({ where: { isActive: true } });
  if (!company) {
    console.log('No active company found, creating generic one...');
    company = companyRepo.create({ name: 'Generic Corp', isActive: true });
    await companyRepo.save(company);
  }

  console.log(`Using company: ${company.name} (${company.id})`);

  // Create new mock test
  const testRepo = AppDataSource.getRepository(MockTest);
  const mockTest = testRepo.create({
    companyId: company.id,
    title: 'Full Placement Mock Test (Dummy)',
    description:
      'This is a sample dummy test created by Emble AI for you to test the new simulation dashboard.',
    totalDurationMinutes: 60,
    order: 1,
  });
  await testRepo.save(mockTest);
  console.log(`Created Mock Test: ${mockTest.id}`);

  // Create a section
  const sectionRepo = AppDataSource.getRepository(MockTestSection);
  const section1 = sectionRepo.create({
    mockTestId: mockTest.id,
    title: 'Aptitude & Technical',
    durationMinutes: 45,
    order: 1,
  });
  await sectionRepo.save(section1);
  console.log(`Created Section: ${section1.id}`);

  // Add Questions
  const questionRepo = AppDataSource.getRepository(MockTestQuestion);
  const qData = [
    {
      type: MockQuestionType.SINGLE_CORRECT,
      question: 'What is the next number in the series: 2, 4, 8, 16, ...?',
      options: ['24', '32', '64', '128'],
      correctAnswer: '1',
      marks: 2,
    },
    {
      type: MockQuestionType.TEXT,
      question: 'Explain OOP concepts in one paragraph.',
      correctAnswer: '',
      marks: 5,
    },
    {
      type: MockQuestionType.SINGLE_CORRECT,
      question: 'Which of the following is not a primitive data type in Java?',
      options: ['int', 'float', 'String', 'boolean'],
      correctAnswer: '2',
      marks: 1,
    },
    {
      type: MockQuestionType.TEXT,
      question:
        'Write an SQL query to find the 2nd highest salary from an Employee table.',
      correctAnswer: '',
      marks: 5,
    },
  ];

  for (let i = 0; i < qData.length; i++) {
    const q = qData[i];
    const entity = new MockTestQuestion();
    entity.sectionId = section1.id;
    entity.questionType = q.type;
    entity.questionText = q.question;
    entity.optionsJson = q.options || [];
    entity.correctAnswer = q.correctAnswer;
    entity.marks = q.marks;
    entity.order = i;
    await questionRepo.save(entity);
  }
  console.log('Seeded 4 questions to section.');

  await AppDataSource.destroy();
}

run().catch((e) => console.error(e));
