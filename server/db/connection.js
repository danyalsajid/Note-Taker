import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

// Create database connection
export const sqlite = new Database('./db.sqlite');

// Create Drizzle instance
export const db = drizzle(sqlite);