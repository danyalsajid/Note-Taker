import { db, sqlite } from './connection.js';
import { notes, users, hierarchyNodes, hierarchyClosure, attachments } from './schema.js';
import { seedDatabase } from './seed.js';

// Initialize database function
export const initializeDatabase = async () => {  
  try {
    console.log('Creating tables from schema');
    
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS hierarchy_nodes (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        attached_to_id TEXT NOT NULL,
        attached_to_type TEXT NOT NULL,
        tags TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (attached_to_id) REFERENCES hierarchy_nodes(id) ON DELETE CASCADE
      )
    `);

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS hierarchy_closure (
        ancestor TEXT NOT NULL,
        descendant TEXT NOT NULL,
        depth INTEGER NOT NULL,
        PRIMARY KEY (ancestor, descendant),
        FOREIGN KEY (ancestor) REFERENCES hierarchy_nodes(id) ON DELETE CASCADE,
        FOREIGN KEY (descendant) REFERENCES hierarchy_nodes(id) ON DELETE CASCADE
      )
    `);

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        note_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        path TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
      )
    `);

    console.log('Tables created successfully!');
    
    await seedDatabase(db);
    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// Export schema for use in other files
export { notes, users, hierarchyNodes, hierarchyClosure, attachments };