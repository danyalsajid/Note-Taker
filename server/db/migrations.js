// Database table creation functions
export const createTables = (sqlite) => {
    try {
        sqlite.exec(`
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL
            )
        `);
    } catch (error) {
        console.error('Error creating notes table:', error);
        throw error;
    }

    console.log('All tables created successfully!');
};