import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Company } from './src/test-series/entities/company.entity';
import { MockTest } from './src/test-series/entities/mock-test.entity';
import { MockTestSection } from './src/test-series/entities/mock-test-section.entity';
import { MockTestQuestion } from './src/test-series/entities/mock-test-question.entity';

dotenv.config({ path: '.env.development' });

const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [Company, MockTest, MockTestSection, MockTestQuestion],
    synchronize: false,
});

async function run() {
    await AppDataSource.initialize();

    // Check total counts
    const mockRepo = AppDataSource.getRepository(MockTest);
    const c = await mockRepo.count();
    console.log("Total mock tests:", c);

    const sectionRepo = AppDataSource.getRepository(MockTestSection);
    const sc = await sectionRepo.count();
    console.log("Total sections:", sc);

    const questionRepo = AppDataSource.getRepository(MockTestQuestion);
    const qc = await questionRepo.count();
    console.log("Total questions:", qc);

    const tests = await mockRepo.find({ relations: ['sections', 'sections.questions'] });
    for (const test of tests) {
        console.log(`Test: ${test.title} (ID: ${test.id})`);
        for (const section of test.sections || []) {
            console.log(`  Section: ${section.title} (ID: ${section.id}) - Questions: ${section.questions?.length}`);
        }
    }

    await AppDataSource.destroy();
}

run().catch(console.error);
