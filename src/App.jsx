// src/App.jsx
import { createSignal, onMount } from "solid-js";

export default function App() {
	const [notes, setNotes] = createSignal([]);
	const [newText, setNewText] = createSignal("");

	// Fetch notes from backend
	const fetchNotes = async () => {
		try {
			const res = await fetch("http://localhost:3001/api/notes");
			const data = await res.json();
			setNotes(data);
		} catch (err) {
			console.error("Error fetching notes:", err);
		}
	};

	// Add a new note
	const addNote = async () => {
		if (!newText().trim()) return; // prevent empty notes
		try {
			const res = await fetch("http://localhost:3001/api/notes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: newText() }),
			});
			const data = await res.json();
			setNotes([...notes(), data]); // add to local state
			setNewText(""); // clear input
		} catch (err) {
			console.error("Error adding note:", err);
		}
	};

	// Delete a note
	const deleteNote = async (id) => {
		try {
			await fetch(`http://localhost:3001/api/notes/${id}`, { method: "DELETE" });
			setNotes(notes().filter(n => n.id !== id));
		} catch (err) {
			console.error("Error deleting note:", err);
		}
	};

	onMount(fetchNotes);

	return (
		<div class="container mt-4">
			<h2>My Notes</h2>

			{/* Add note section */}
			<div class="input-group mb-3">
				<input
					type="text"
					class="form-control"
					placeholder="Enter a new note"
					value={newText()}
					onInput={(e) => setNewText(e.target.value)}
				/>
				<button class="btn btn-success" onClick={addNote}>
					Add Note
				</button>
			</div>

			{/* Refresh button */}
			<button class="btn btn-primary mb-3" onClick={fetchNotes}>
				Refresh Notes
			</button>

			{/* Notes list */}
			<ul class="list-group">
				{notes().map(note => (
					<li class="list-group-item d-flex justify-content-between align-items-center">
						{note.text}
						<button
							class="btn btn-danger btn-sm"
							onClick={() => deleteNote(note.id)}
						>
							Delete
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
