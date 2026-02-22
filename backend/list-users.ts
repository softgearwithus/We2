import { DataSource } from "typeorm";
import { User } from "./src/users/user.entity";
import * as dotenv from "dotenv";
import { resolveDbConfig } from "./src/common/db-config";

dotenv.config();

const AppDataSource = new DataSource({
    type: "postgres",
    ...resolveDbConfig(),
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
