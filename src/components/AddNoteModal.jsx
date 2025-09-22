import { createSignal, Show } from "solid-js";

export default function AddNoteModal({ isOpen, onClose, selectedItem, onSave }) {
  const [noteText, setNoteText] = createSignal("");
  const [tags, setTags] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const predefinedTags = [
    "Assessment", "Medication", "Follow-up", "Urgent", "Progress", 
    "Treatment", "Diagnosis", "Lab Results", "Consultation", "Discharge"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!noteText().trim()) {
      alert("Note text is required!");
      return;
    }

    setLoading(true);

    try {
      const newNote = {
        content: noteText().trim(),
        attachedToId: selectedItem().id,
        attachedToType: selectedItem().type,
        tags: tags().split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await onSave(newNote);
      handleClose();
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note. Please try again.");
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
    <Show when={isOpen()}>
      <div class="modal show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                Add Note
                {selectedItem() && (
                  <small class="text-muted d-block">
                    to {selectedItem().name}
                  </small>
                )}
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

                {selectedItem() && (
                  <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    This note will be attached to: <strong>{selectedItem().name}</strong>
                  </div>
                )}
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <i class="bi bi-check me-1"></i>
                      Save Note
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
