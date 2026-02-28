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
  autoCreateExtension?: boolean;
};

type ParsedDatabaseUrl = {
  host: string;
  port?: number;
  username: string;
  password: string;
  database: string;
  sslMode?: string;
};

const parseDatabaseUrl = (value: string): ParsedDatabaseUrl => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('DATABASE_URL must be a valid URL');
  }

  if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') {
    throw new Error('DATABASE_URL must use postgres:// or postgresql://');
  }

  const database = url.pathname.replace(/^\//, '');
  if (!database) {
    throw new Error('DATABASE_URL must include a database name');
  }

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : undefined,
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
    sslMode: url.searchParams.get('sslmode') || undefined,
  };
};

export const resolveDbConfig = (configService?: ConfigService): DbConfig => {
  const read = (key: string) =>
    configService ? configService.get<string>(key) : process.env[key];

  const databaseUrl = read('DATABASE_URL');
  const parsedUrl = databaseUrl ? parseDatabaseUrl(databaseUrl) : null;

  if (databaseUrl && databaseUrl.includes('supabase')) {
    throw new Error('Supabase is not supported. Use Postgres directly.');
  }

  if (!parsedUrl && !read('PGHOST') && !read('DB_HOST')) {
    throw new Error(
      'Database configuration missing. Set DATABASE_URL or PGHOST/DB_HOST.',
    );
  }

  if (read('DB_TYPE') && read('DB_TYPE') !== 'postgres') {
    throw new Error('Only Postgres is supported. Remove DB_TYPE or set it to postgres.');
  }

  const host =
    parsedUrl?.host || read('PGHOST') || read('DB_HOST') || 'localhost';
  const port = parsedUrl?.port
    ? parsedUrl.port
    : parseInt(read('PGPORT') || read('DB_PORT') || '5432', 10);
  const username =
    parsedUrl?.username ||
    read('PGUSER') ||
    read('DB_USER') ||
    read('DB_USERNAME') ||
    'admin';
  const password =
    parsedUrl?.password || read('PGPASSWORD') || read('DB_PASSWORD') || 'password';
  const database =
    parsedUrl?.database ||
    read('PGDATABASE') ||
    read('DB_NAME') ||
    read('DB_DATABASE') ||
    'college_prep_db';
  const defaultDatabase = read('DB_DEFAULT_DATABASE') || 'postgres';
  const sslMode = parsedUrl?.sslMode || read('PGSSLMODE');
  const sslEnabled =
    read('DB_SSL') === 'true' ||
    sslMode === 'require' ||
    sslMode === 'verify-ca' ||
    sslMode === 'verify-full';
  const autoCreate = read('DB_AUTO_CREATE') === 'true';
  const autoCreateExtension = read('DB_AUTO_CREATE_EXTENSION') === 'true';
  const uuidExtensionRaw = read('DB_UUID_EXTENSION') || 'pgcrypto';
  const uuidExtension =
    uuidExtensionRaw === 'uuid-ossp' ? 'uuid-ossp' : 'pgcrypto';
  const ssl = sslEnabled ? { rejectUnauthorized: false } : undefined;

  const nodeEnv = read('NODE_ENV') || 'development';
  const localHosts = new Set(['localhost', '127.0.0.1', 'postgres', 'host.docker.internal']);
  if (nodeEnv !== 'production' && !localHosts.has(host)) {
    throw new Error('Development mode requires a local Postgres host.');
  }
  if (nodeEnv === 'production' && localHosts.has(host)) {
    throw new Error('Production must not use a local Postgres host.');
  }

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
    autoCreateExtension,
  };
};
