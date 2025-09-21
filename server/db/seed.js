import { notesTable } from './schema.js';

// Seed data
const seedNotes = [
  { text: 'Welcome to your notes app! This is your first note.' },
  { text: 'You can create, edit, and delete notes easily.' },
  { text: 'This app uses SQLite database with Drizzle ORM.' },
  { text: 'Feel free to modify or delete these sample notes.' },
  { text: 'Start taking your own notes now!' }
];

export const seedDatabase = async (db) => {
  
  try {
    const existingNotes = await db.select().from(notesTable).limit(1);
    
    // Database already contains data, skip seeding
    if (existingNotes.length > 0) {
      return;
    }

    // Insert all seed data
    await db.insert(notesTable).values(seedNotes);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};