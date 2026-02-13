import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

// Gracefully handle missing DATABASE_URL - routes will return errors but app won't crash
let db: ReturnType<typeof drizzle>;

if (connectionString && connectionString !== 'postgresql://user:password@host/database') {
  const sql = neon(connectionString);
  db = drizzle(sql, { schema });
} else {
  // Create a proxy that throws helpful errors when routes are called without DB
  db = new Proxy({} as any, {
    get: () => () => {
      throw new Error('DATABASE_URL not configured. Set a real PostgreSQL connection string in .env');
    }
  });
}

export { db };
