import 'dotenv/config';

import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';

const globalForDb = globalThis as unknown as {
  mysqlPool?: ReturnType<typeof mysql.createPool>;
};

const pool =
  globalForDb.mysqlPool ??
  mysql.createPool({
    uri: process.env.DATABASE_URL,

    waitForConnections: true,

    connectionLimit: 10,
    maxIdle: 10,

    idleTimeout: 60_000,
    queueLimit: 0,

    enableKeepAlive: true,
    keepAliveInitialDelay: 0,

    connectTimeout: 10_000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.mysqlPool = pool;
}

export const db = drizzle(pool);

export { pool };
