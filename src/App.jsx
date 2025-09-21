import { createSignal, onMount } from 'solid-js';

function App() {
  const [notes, setNotes] = createSignal([]);

  onMount(async () => {
    const res = await fetch('http://localhost:3001/api/notes');
    const data = await res.json();
    setNotes(data);
  });

  return (
    <div class="container mt-5">
      <h1 class="text-primary">Notes</h1>
      <ul>
        {notes().map(note => (
          <li key={note.id}>{note.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
