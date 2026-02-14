import { DataSource } from 'typeorm';
import { CourseContent } from './src/course-content/entities/course-content.entity';
import { AiService } from './src/ai/ai.service';

const AppDataSource = new DataSource({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [CourseContent],
    synchronize: true,
});

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected for AI Content Sync.");

        const repo = AppDataSource.getRepository(CourseContent);
        // Mock ConfigService to use process.env for standalone script
        const mockConfigService = {
            get: (key: string) => process.env[key]
        } as any;
        const aiService = new AiService(mockConfigService);

        const topics = [
            { id: 'introduction-to-programming', title: 'Mastering the Art of Programming' },
            { id: 'variables,-data-types-&-i/o', title: 'Variables, Data Types & Input/Output' },
            { id: 'control-flow-(if/else-&-switch)', title: 'Making Decisions: Control Flow' },
            { id: 'loops-&-iterations', title: 'Repetitive Tasks: Loops & Iterations' },
            { id: 'pattern-printing-(logic-building)', title: 'Logic Building with Pattern Printing' },
            { id: 'functions-&-scope', title: 'Modular Code: Functions & Scope' }
        ];

        console.log("Generating AI Pro-level guides...");

        for (const topic of topics) {
            console.log(`Generating for ${topic.id}...`);
            const aiContent = await aiService.generateContent(topic.id, topic.title);

            const existing = await repo.findOne({ where: { topicId: topic.id } });
            if (existing) {
                existing.title = topic.title;
                existing.content = aiContent;
                await repo.save(existing);
                console.log(`Updated: ${topic.id}`);
            } else {
                const content = repo.create({
                    topicId: topic.id,
                    title: topic.title,
                    content: aiContent
                });
                await repo.save(content);
                console.log(`Created: ${topic.id}`);
            }
        }

        console.log("AI Content Sync Completed Successfully!");

    } catch (error) {
        console.error("Error during AI sync:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
