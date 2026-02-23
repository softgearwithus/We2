import { ConfigService } from '@nestjs/config';

export type DbConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  defaultDatabase: string;
  ssl?: { rejectUnauthorized: boolean };
  uuidExtension?: 'pgcrypto' | 'uuid-ossp';
  autoCreate?: boolean;
};

export const resolveDbConfig = (configService?: ConfigService): DbConfig => {
  const read = (key: string) =>
    configService ? configService.get<string>(key) : process.env[key];

  const host = read('PGHOST') || read('DB_HOST') || 'localhost';
  const port = parseInt(read('PGPORT') || read('DB_PORT') || '5432', 10);
  const username =
    read('PGUSER') || read('DB_USER') || read('DB_USERNAME') || 'admin';
  const password = read('PGPASSWORD') || read('DB_PASSWORD') || 'password';
  const database =
    read('PGDATABASE') || read('DB_NAME') || read('DB_DATABASE') || 'college_prep_db';
  const defaultDatabase = read('DB_DEFAULT_DATABASE') || 'postgres';
  const sslMode = read('PGSSLMODE');
  const sslEnabled =
    read('DB_SSL') === 'true' ||
    sslMode === 'require' ||
    sslMode === 'verify-ca' ||
    sslMode === 'verify-full';
  const autoCreate = read('DB_AUTO_CREATE') === 'true';
  const uuidExtensionRaw = read('DB_UUID_EXTENSION') || 'pgcrypto';
  const uuidExtension =
    uuidExtensionRaw === 'uuid-ossp' ? 'uuid-ossp' : 'pgcrypto';
  const ssl = sslEnabled ? { rejectUnauthorized: false } : undefined;

  return {
    host,
    port,
    username,
    password,
    database,
    defaultDatabase,
    ssl,
    uuidExtension,
    autoCreate,
  };
};
