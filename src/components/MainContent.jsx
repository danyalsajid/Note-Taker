import { createSignal, For, Show } from "solid-js";

export default function MainContent({ 
  selectedItem, 
  onAddNote, 
  onEditNote, 
  onDeleteNote, 
  onEditItem, 
  onDeleteItem,
  onAISummary 
}) {
  // Mock notes data for selected item
  const [notes] = createSignal([
    {
      id: 1,
      text: "Prescribed Lisinopril 10mg daily for hypertension. Patient advised to monitor blood pressure at home.",
      tags: ["Medication", "Follow-up"],
      createdAt: "2024-01-09T08:30:00Z",
      createdBy: "Dr. Smith"
    },
    {
      id: 2,
      text: "Patient reports feeling better since last visit. Blood pressure readings have improved.",
      tags: ["Assessment", "Progress"],
      createdAt: "2024-01-09T08:35:00Z",
      createdBy: "Dr. Smith"
    }
  ]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getItemTypeLabel = (type) => {
    switch (type) {
      case 'organization': return 'Organization';
      case 'team': return 'Department/Team';
      case 'client': return 'Patient';
      case 'episode': return 'Episode';
      default: return 'Item';
    }
  };

  return (
    <div class="main-content flex-grow-1 p-4">
      <Show
        when={selectedItem()}
        fallback={
          <div class="welcome-section text-center py-5">
            <div class="mb-4">
              <i class="bi bi-clipboard-data display-1 text-muted"></i>
            </div>
            <h2 class="text-muted mb-3">Welcome to Healthcare Notes</h2>
            <p class="text-muted lead">
              Select an organization, department, patient, or episode from the sidebar to view and manage notes.
            </p>
            <div class="row mt-5">
              <div class="col-md-4">
                <div class="card border-0 shadow-sm">
                  <div class="card-body text-center">
                    <i class="bi bi-hospital display-4 text-primary mb-3"></i>
                    <h5>Organizations</h5>
                    <p class="text-muted small">Manage healthcare facilities and institutions</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 shadow-sm">
                  <div class="card-body text-center">
                    <i class="bi bi-people display-4 text-success mb-3"></i>
                    <h5>Departments</h5>
                    <p class="text-muted small">Organize by medical departments and teams</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 shadow-sm">
                  <div class="card-body text-center">
                    <i class="bi bi-clipboard-pulse display-4 text-info mb-3"></i>
                    <h5>Patient Episodes</h5>
                    <p class="text-muted small">Track patient consultations and treatments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div class="selected-item-content">
          {/* Item Details Header */}
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="mb-1">
                    <i class={`bi ${
                      selectedItem().type === 'organization' ? 'bi-hospital' :
                      selectedItem().type === 'team' ? 'bi-people' :
                      selectedItem().type === 'client' ? 'bi-person' :
                      'bi-clipboard'
                    } me-2`}></i>
                    {selectedItem().name}
                  </h5>
                  <small class="opacity-75">
                    {getItemTypeLabel(selectedItem().type)}
                    {selectedItem().date && ` • Created: ${selectedItem().date}`}
                  </small>
                </div>
                <div class="btn-group">
                  <button
                    class="btn btn-light btn-sm"
                    onClick={() => onEditItem(selectedItem())}
                    title="Edit Item"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn btn-outline-light btn-sm"
                    onClick={() => onDeleteItem(selectedItem())}
                    title="Delete Item"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div class="notes-section">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">
                <i class="bi bi-journal-text me-2"></i>
                Notes ({notes().length})
              </h6>
              <div class="btn-group">
                <button
                  class="btn btn-primary btn-sm"
                  onClick={() => onAddNote(selectedItem())}
                >
                  <i class="bi bi-plus me-1"></i>
                  Add Note
                </button>
                <button
                  class="btn btn-info btn-sm"
                  onClick={() => onAISummary(selectedItem(), notes())}
                >
                  <i class="bi bi-robot me-1"></i>
                  AI Summary
                </button>
              </div>
            </div>

            <Show
              when={notes().length > 0}
              fallback={
                <div class="text-center py-5">
                  <i class="bi bi-journal-x display-4 text-muted mb-3"></i>
                  <p class="text-muted">No notes available for this item.</p>
                  <button
                    class="btn btn-primary"
                    onClick={() => onAddNote(selectedItem())}
                  >
                    <i class="bi bi-plus me-1"></i>
                    Add First Note
                  </button>
                </div>
              }
            >
              <div class="notes-list">
                <For each={notes()}>
                  {(note) => (
                    <div class="card mb-3">
                      <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <div class="note-meta">
                            <small class="text-muted">
                              <i class="bi bi-person me-1"></i>
                              {note.createdBy} • {formatDate(note.createdAt)}
                            </small>
                          </div>
                          <div class="btn-group btn-group-sm">
                            <button
                              class="btn btn-outline-secondary"
                              onClick={() => onEditNote(note)}
                              title="Edit Note"
                            >
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button
                              class="btn btn-outline-danger"
                              onClick={() => onDeleteNote(note)}
                              title="Delete Note"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                        
                        <p class="note-text mb-2">{note.text}</p>
                        
                        <div class="note-tags">
                          <For each={note.tags}>
                            {(tag) => (
                              <span class="badge bg-secondary me-1">{tag}</span>
                            )}
                          </For>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}
