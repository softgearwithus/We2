import { DataSource } from 'typeorm';
import { Interview } from './interview/entities/interview.entity';
import { User } from './users/user.entity';
import { resolveDbConfig } from './common/db-config';

require('dotenv').config();

const AppDataSource = new DataSource({
    type: 'postgres',
    ...resolveDbConfig(),
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
