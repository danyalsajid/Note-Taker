import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { db, notesTable } from './db/db.js';
import { eq } from 'drizzle-orm';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the dist directory (built frontend)
app.use(express.static(path.join(__dirname, '../dist')));

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

// Health check endpoint for Railway
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all handler: send back SolidJS index.html file for SPA routing
app.get('/*', (req, res) => {
	// Don't serve index.html for API routes
	if (req.path.startsWith('/api/')) {
		return res.status(404).json({ error: 'API endpoint not found' });
	}
	
	res.sendFile(path.join(__dirname, '../dist/index.html'), (err) => {
		if (err) {
			console.error('Error serving index.html:', err);
			res.status(500).send('Error loading page');
		}
	});
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Server error:', err);
	res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on http://localhost:${PORT}`);
	console.log(`Health check available at http://localhost:${PORT}/health`);
	console.log(`API available at http://localhost:${PORT}/api/notes`);
});
