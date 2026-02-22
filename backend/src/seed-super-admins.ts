import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './users/user.entity';
import { resolveDbConfig } from './common/db-config';

dotenv.config();

type SeedUser = {
  email: string;
  password: string;
};

const parseUsersFromEnv = (): SeedUser[] => {
  const raw = process.env.SUPER_ADMIN_USERS;
  if (!raw) return [];

  const parsed = JSON.parse(raw) as SeedUser[];
  return Array.isArray(parsed) ? parsed : [];
};

const parseUsersFromArgs = (): SeedUser[] => {
  const args = process.argv.slice(2);
  if (args.length === 0) return [];
  if (args.length % 2 !== 0) {
    throw new Error('Expected pairs of <email> <password> arguments');
  }

  const users: SeedUser[] = [];
  for (let i = 0; i < args.length; i += 2) {
    users.push({ email: args[i], password: args[i + 1] });
  }

  return users;
};

const getSeedUsers = (): SeedUser[] => {
  const fromEnv = parseUsersFromEnv();
  if (fromEnv.length > 0) return fromEnv;
  return parseUsersFromArgs();
};

const dbType = process.env.DB_TYPE || 'postgres';
if (dbType !== 'postgres') {
  throw new Error('SQLite is not supported. Set DB_TYPE=postgres.');
}

const AppDataSource = new DataSource({
  type: 'postgres',
  ...resolveDbConfig(),
  entities: [User],
  synchronize: false,
});

const normalizeEmail = (email: string) => email.toLowerCase().trim();

async function seed() {
  const users = getSeedUsers();
  if (users.length === 0) {
    throw new Error(
      'No users provided. Use SUPER_ADMIN_USERS env or pass <email> <password> pairs.',
    );
  }

  const dbConfig = resolveDbConfig();
  await AppDataSource.initialize();
  await AppDataSource.synchronize();
  const repo = AppDataSource.getRepository(User);

  for (const user of users) {
    const email = normalizeEmail(user.email);
    const passwordHash = await bcrypt.hash(user.password, 12);

    const existing = await repo.findOne({ where: { email } });
    if (existing) {
      existing.role = UserRole.SUPER_ADMIN;
      existing.password = passwordHash;
      existing.isActive = true;
      await repo.save(existing);
      console.log(`Updated super_admin: ${email}`);
      continue;
    }

    const created = repo.create();
    created.email = email;
    created.password = passwordHash;
    created.role = UserRole.SUPER_ADMIN;
    created.subscriptionPlan = 'free';
    created.subscriptionStatus = 'inactive';
    created.isActive = true;
    await repo.save(created);
    console.log(`Created super_admin: ${email}`);
  }
}

seed()
  .catch((error) => {
    console.error('Failed to seed super admins:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
