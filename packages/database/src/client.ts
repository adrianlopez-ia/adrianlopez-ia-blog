import { createClient as createLibsqlClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

export function createClient(url?: string, authToken?: string) {
  const dbUrl = url ?? process.env.TURSO_DATABASE_URL ?? 'file:local.db';

  const client = createLibsqlClient({
    url: dbUrl,
    authToken: authToken ?? process.env.TURSO_AUTH_TOKEN,
  });

  return drizzle(client, { schema });
}

export const db = createClient();
