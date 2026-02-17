import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User, UserRole } from './users/user.entity';

dotenv.config();

const emailArg = process.argv[2];
if (!emailArg) {
    throw new Error('Usage: npm run admin:promote -- <email>');
}

const dbType = process.env.DB_TYPE || 'postgres';
if (dbType !== 'postgres') {
    throw new Error('SQLite is not supported. Set DB_TYPE=postgres.');
}

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'college_prep_db',
    entities: [User],
    synchronize: true,
});

async function promote() {
    const normalizedEmail = emailArg.toLowerCase().trim();
    await AppDataSource.initialize();

    const usersRepo = AppDataSource.getRepository(User);
    const user = await usersRepo.findOne({ where: { email: normalizedEmail } });
    if (!user) {
        throw new Error(`User not found: ${normalizedEmail}`);
    }

    user.role = UserRole.SUPER_ADMIN;
    await usersRepo.save(user);
    console.log(`User promoted to super_admin: ${normalizedEmail}`);
}

promote()
    .catch((error) => {
        console.error('Failed to promote user:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });
