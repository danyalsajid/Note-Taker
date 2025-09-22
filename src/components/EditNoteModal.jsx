import { createSignal, Show, createEffect } from "solid-js";

export default function EditNoteModal({ isOpen, onClose, note, onSave }) {
  const [noteText, setNoteText] = createSignal("");
  const [tags, setTags] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const predefinedTags = [
    "Assessment", "Medication", "Follow-up", "Urgent", "Progress", 
    "Treatment", "Diagnosis", "Lab Results", "Consultation", "Discharge"
  ];

  // Update form when note changes
  createEffect(() => {
    if (note()) {
      setNoteText(note().content || "");
      const parsedTags = note().tags ? JSON.parse(note().tags) : [];
      setTags(Array.isArray(parsedTags) ? parsedTags.join(', ') : "");
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!noteText().trim()) {
      alert("Note text is required!");
      return;
    }

    setLoading(true);

    try {
      const updatedNote = {
        ...note(),
        content: noteText().trim(),
        tags: tags().split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await onSave(updatedNote);
      handleClose();
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNoteText("");
    setTags("");
    onClose();
  };

  const addPredefinedTag = (tag) => {
    const currentTags = tags().split(',').map(t => t.trim()).filter(t => t);
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(', ');
      setTags(newTags);
    }
  };

  return (
    <Show when={isOpen() && note()}>
      <div class="modal show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                Edit Note
                <small class="text-muted d-block">
                  Created: {new Date(note().createdAt).toLocaleDateString()}
                </small>
              </h5>
              <button
                type="button"
                class="btn-close"
                onClick={handleClose}
              ></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div class="modal-body">
                <div class="mb-3">
                  <label for="noteText" class="form-label">Note Content *</label>
                  <textarea
                    class="form-control"
                    id="noteText"
                    rows="6"
                    value={noteText()}
                    onInput={(e) => setNoteText(e.target.value)}
                    placeholder="Enter your note here..."
                    required
                  ></textarea>
                </div>

                <div class="mb-3">
                  <label for="tags" class="form-label">Tags</label>
                  <input
                    type="text"
                    class="form-control"
                    id="tags"
                    value={tags()}
                    onInput={(e) => setTags(e.target.value)}
                    placeholder="Enter tags separated by commas (e.g., Assessment, Medication)"
                  />
                  <div class="form-text">Separate multiple tags with commas</div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Quick Tags</label>
                  <div class="d-flex flex-wrap gap-1">
                    {predefinedTags.map(tag => (
                      <button
                        type="button"
                        class="btn btn-outline-secondary btn-sm"
                        onClick={() => addPredefinedTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div class="alert alert-secondary">
                  <small>
                    <i class="bi bi-info-circle me-1"></i>
                    <strong>Created:</strong> {new Date(note().createdAt).toLocaleString()}
                    {note().updatedAt && note().updatedAt !== note().createdAt && (
                      <span> • <strong>Updated:</strong> {new Date(note().updatedAt).toLocaleString()}</span>
                    )}
                  </small>
                </div>
              </div>
              
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  onClick={handleClose}
                  disabled={loading()}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  disabled={loading()}
                >
                  {loading() ? (
                    <>
                      <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i class="bi bi-check me-1"></i>
                      Update Note
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Show>
  );
}
