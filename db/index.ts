import { drizzle } from 'drizzle-orm/netlify-db';
import { sql } from 'drizzle-orm';
import { records } from './schema.js';
import { createInitialState, DatabaseService, requestDatabase, type DBState } from '../server/db.js';

export async function withDatabase<T>(action: () => Promise<T>): Promise<T> {
  const database = drizzle();
  return database.transaction(async tx => {
    // Serialize the existing multi-record workflows across function instances.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(7362881)`);
    const stored = await tx.select().from(records);
    const initialized = stored.some(row => row.collection === '_meta' && row.id === 'seeded');
    const state = createInitialState();
    if (initialized) {
      for (const key of Object.keys(state) as (keyof DBState)[]) {
        (state[key] as any[]) = stored.filter(row => row.collection === key).map(row => row.data);
      }
    }
    const original = JSON.stringify(state);
    const service = new DatabaseService(state);
    const result = await requestDatabase.run(service, action);
    const snapshot = service.snapshot();
    if (!initialized || JSON.stringify(snapshot) !== original) {
      // All changes, audit logs, and notifications commit atomically.
      await tx.delete(records);
      const rows = Object.entries(snapshot).flatMap(([collection, values]) =>
        values.map((data: Record<string, any>) => ({ collection, id: data.id as string, data })));
      rows.push({ collection: '_meta', id: 'seeded', data: {} });
      for (let offset = 0; offset < rows.length; offset += 100) {
        await tx.insert(records).values(rows.slice(offset, offset + 100));
      }
    }
    return result;
  });
}
