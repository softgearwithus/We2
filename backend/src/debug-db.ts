import { DataSource } from 'typeorm';
import { Interview } from './interview/entities/interview.entity';
import { User } from './users/user.entity';

require('dotenv').config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'college_prep_db',
    entities: [Interview, User],
    synchronize: true, // This mimics dev behavior
});

async function debug() {
    try {
        console.log("Connecting to DB...");
        await AppDataSource.initialize();
        console.log("Connected!");

        console.log("Attempting to save Interview...");
        const repo = AppDataSource.getRepository(Interview);
        const interview = repo.create({
            userId: 'debug-user',
            status: 'active',
            history: []
        });

        await repo.save(interview);
        console.log("Success! Interview saved with ID:", interview.id);

    } catch (error) {
        console.error("ERROR:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

debug();
