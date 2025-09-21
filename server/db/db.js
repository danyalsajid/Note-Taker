import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Define Notes table
export const notesTable = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text'),
});

// Connect to SQLite database
const sqlite = new Database('./db.sqlite');
export const db = drizzle(sqlite);

// Create table if it doesn't exist
sqlite.prepare(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT
  )
`).run();