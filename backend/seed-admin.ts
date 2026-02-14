import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './src/users/user.entity';

const AppDataSource = new DataSource({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [User],
    synchronize: true,
});

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected.");

        const repo = AppDataSource.getRepository(User);
        const email = 'admin@prep0.com';
        const rawPassword = 'AdminPassword123!';

        const existing = await repo.findOne({ where: { email } });
        if (existing) {
            console.log("Admin user already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        const admin = repo.create({
            email,
            password: hashedPassword,
            role: UserRole.SUPER_ADMIN,
            subscriptionPlan: 'we2_max',
            subscriptionStatus: 'active',
        });

        await repo.save(admin);
        console.log("Admin user created successfully!");
        console.log("Email:", email);
        console.log("Password:", rawPassword);

    } catch (error) {
        console.error("Error seeding admin:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
