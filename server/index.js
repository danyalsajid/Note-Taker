import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS for development
app.use(cors());

app.use(bodyParser.json());

// In-memory notes
let notes = [
	{ id: 1, text: 'First note' },
	{ id: 2, text: 'Second note' },
];

///////////////////////////////////
// CRUD routes

// Get all notes
app.get('/api/notes', (req, res) => res.json(notes));

// Create a new note
app.post('/api/notes', (req, res) => {
	const { text } = req.body;
	const newNote = { id: Date.now(), text };
	notes.push(newNote);
	res.json(newNote);
});

// Update a note
app.put('/api/notes/:id', (req, res) => {
	const id = parseInt(req.params.id);
	const { text } = req.body;
	const note = notes.find(n => n.id === id);
	if (note) {
		note.text = text;
		res.json(note);
	} else {
		res.status(404).json({ error: 'Note not found' });
	}
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
	const id = parseInt(req.params.id);
	notes = notes.filter(n => n.id !== id);
	res.json({ success: true });
});

/////////////////////////////////
// CRUD routes end

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
