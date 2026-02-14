import { DataSource } from "typeorm";
import { User } from "./src/users/user.entity";
import * as dotenv from "dotenv";

dotenv.config();

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432") || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "college_prep",
    entities: [User],
    synchronize: false,
});

async function listUsers() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected.");

        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find({
            select: ["id", "email", "role", "subscriptionPlan", "subscriptionStatus"]
        });

        console.log("\n--- Registered Users ---");
        if (users.length === 0) {
            console.log("No users found.");
        } else {
            console.table(users);
        }
        console.log("------------------------\n");

        await AppDataSource.destroy();
    } catch (error) {
        console.error("Error:", error);
    }
}

listUsers();
