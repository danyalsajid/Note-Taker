import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { eq } from 'drizzle-orm';
import path from 'path';
import { fileURLToPath } from 'url';

// Database 
import { db } from './db/connection.js';
import { notes } from './db/schema.js';
import { initializeDatabase } from './db/database.js';
import {
	getChildren,
	getNodesByType,
} from './db/hierarchy-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
await initializeDatabase();

app.use(cors());
app.use(bodyParser.json());

// Helper function to build hierarchical data
async function buildHierarchicalData() {
	const organisations = await getNodesByType('organisation');
	const result = {
		organisations: [],
		teams: [],
		clients: [],
		episodes: [],
		notes: []
	};

	// Get all nodes
	for (const org of organisations) {
		result.organisations.push(org);

		const teams = await getChildren(org.id);
		for (const team of teams) {
			result.teams.push({ ...team, parentId: org.id });

			const clients = await getChildren(team.id);
			for (const client of clients) {
				result.clients.push({ ...client, parentId: team.id });

				const episodes = await getChildren(client.id);
				for (const episode of episodes) {
					result.episodes.push({ ...episode, parentId: client.id });
				}
			}
		}
	}

	// Get all notes
	const allNotes = await db.select().from(notes);
	result.notes = allNotes.map(note => ({
		id: note.id,
		content: note.content,
		attachedToId: note.attachedToId,
		attachedToType: note.attachedToType,
		tags: note.tags ? JSON.parse(note.tags) : [],
		createdAt: note.createdAt,
		updatedAt: note.updatedAt
	}));

	return result;
}

///////////////////////////////////
// CRUD routes

// Get all data
app.get('/api/data', async (req, res) => {
	try {
		const data = await buildHierarchicalData();
		res.json(data);
	} catch (error) {
		console.error('Get data error:', error);
		res.status(500).json({ error: 'Failed to fetch data' });
	}
});

// Get all notes
app.get('/api/notes', async (req, res) => {
	const allNotes = await db.select().from(notes);
	res.json(allNotes);
});

// Create a new note
app.post('/api/notes', async (req, res) => {
	const { text } = req.body;
	const [newNote] = await db
		.insert(notes)
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

// Serve static files from the dist directory (built frontend) - AFTER API routes
app.use(express.static(path.join(__dirname, '../dist')));

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Server error:', err);
	res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on http://localhost:${PORT}`);
});