import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';


// Define Notes table schema
export const notesTable = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull()
});

// Export all tables for easy access
export const tables = {
  notes: notesTable,
};