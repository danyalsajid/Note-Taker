import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { notesTable } from './schema.js';
import { createTables } from './migrations.js';
import { seedDatabase } from './seed.js';

// Connect to SQLite database
const sqlite = new Database('./db.sqlite');
export const db = drizzle(sqlite);

// Initialize database function
export const initializeDatabase = async () => {  
  try {
    createTables(sqlite);
    await seedDatabase(db);
    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// Export schema for use in other files
export { notesTable };