import { pgTable, text, jsonb, primaryKey } from 'drizzle-orm/pg-core';

// Retain the existing domain objects, with independently addressable records.
export const records = pgTable('setu_records', {
  collection: text('collection').notNull(),
  id: text('id').notNull(),
  data: jsonb('data').$type<Record<string, any>>().notNull(),
}, table => [primaryKey({ columns: [table.collection, table.id] })]);
