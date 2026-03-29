import { DataSource } from 'typeorm';
import { resolveDbConfig } from './common/db-config';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const AppDataSource = new DataSource({
  type: 'postgres',
  ...resolveDbConfig(),
});

async function count() {
  await AppDataSource.initialize();
  const res = await AppDataSource.query('SELECT COUNT(*) FROM "companies"');
  console.log(`Companies: ${res[0].count}`);
  await AppDataSource.destroy();
}

count().catch(console.error);
