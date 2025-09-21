import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { db, notesTable } from './db/db.js';
import { eq } from 'drizzle-orm';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

///////////////////////////////////
// CRUD routes

// Get all notes
app.get('/api/notes', async (req, res) => {
	const notes = await db.select().from(notesTable);
	res.json(notes);
});

// Create a new note
app.post('/api/notes', async (req, res) => {
	const { text } = req.body;
	const [newNote] = await db
		.insert(notesTable)
		.values({ text })
		.returning(); // returns the inserted row
	res.json(newNote);
});

// Update a note
app.put('/api/notes/:id', async (req, res) => {
	const id = parseInt(req.params.id);
	const { text } = req.body;

	const updated = await db
		.update(notesTable)
		.set({ text })
		.where(eq(notesTable.id, id))
		.returning();

	if (updated.length) {
		res.json(updated[0]);
	} else {
		res.status(404).json({ error: 'Note not found' });
	}
});

// Delete a note
app.delete('/api/notes/:id', async (req, res) => {
	const id = parseInt(req.params.id);
	await db.delete(notesTable).where(eq(notesTable.id, id));
	res.json({ success: true });
});

/////////////////////////////////
// CRUD routes end

// Start server
app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
