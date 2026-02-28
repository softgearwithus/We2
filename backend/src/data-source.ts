import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { resolveDbConfig } from './common/db-config';

const nodeEnv = process.env.NODE_ENV || 'development';
if (nodeEnv === 'development') {
    dotenv.config({ path: '.env.development' });
}

const dbConfig = resolveDbConfig();

export default new DataSource({
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    ssl: dbConfig.ssl,
    uuidExtension: dbConfig.uuidExtension,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    migrationsTableName: 'typeorm_migrations',
});
