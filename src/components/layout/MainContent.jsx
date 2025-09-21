import { createSignal, createEffect, Show, For } from 'solid-js';
import { getNotesByEpisode } from '../../data/seedData';

export default function MainContent(props) {
  const [notes, setNotes] = createSignal([]);

  // Update notes when selected item changes
  createEffect(() => {
    if (props.selectedItem?.type === 'episode') {
      setNotes(getNotesByEpisode(props.selectedItem.item.id));
    } else {
      setNotes([]);
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getItemTypeLabel = (type) => {
    const labels = {
      'organization': 'Organization',
      'team': 'Team',
      'client': 'Client',
      'episode': 'Episode'
    };
    return labels[type] || type;
  };

  const WelcomeMessage = () => (
    <div class="d-flex justify-content-center align-items-center h-100">
      <div class="text-center" style="max-width: 600px;">
        <div class="mb-4">
          <i class="fa fa-clipboard-list text-primary" style="font-size: 4rem;"></i>
        </div>
        <h2 class="display-6 fw-bold mb-3">Welcome to Healthcare Notes</h2>
        <p class="lead text-muted mb-4">
          Select an organization, team, client, or episode from the sidebar to view and manage notes.
        </p>
        <div class="row g-3">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body d-flex align-items-center">
                <i class="fa fa-sitemap text-primary me-3" style="font-size: 1.5rem;"></i>
                <span>Organize notes by healthcare hierarchy</span>
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body d-flex align-items-center">
                <i class="fa fa-calendar-check text-primary me-3" style="font-size: 1.5rem;"></i>
                <span>Track episodes and consultations</span>
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body d-flex align-items-center">
                <i class="fa fa-sticky-note text-primary me-3" style="font-size: 1.5rem;"></i>
                <span>Add detailed notes with custom tags</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ItemDetails = () => {
    const item = props.selectedItem;
    if (!item) return null;

    return (
      <div class="card border-0 shadow-sm card-hover">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
            <div>
              <span class="badge bg-primary mb-2 px-3 py-2">{getItemTypeLabel(item.type)}</span>
              <h2 class="h3 fw-bold mb-2 text-dark">{item.item.name}</h2>
              <p class="text-muted mb-0">
                <i class="fa fa-clock me-1"></i>
                Created: {formatDate(item.item.createdAt)}
              </p>
            </div>
            
            <div class="d-flex gap-2">
              <button 
                class="btn btn-outline-secondary btn-sm btn-icon"
                onClick={() => props.onEditItem?.(item.item, item.type)}
              >
                <i class="fa fa-edit"></i>
                Edit
              </button>
              <button 
                class="btn btn-outline-danger btn-sm btn-icon"
                onClick={() => props.onDeleteItem?.(item.item, item.type)}
              >
                <i class="fa fa-trash"></i>
                Delete
              </button>
            </div>
          </div>

          <Show when={item.type === 'episode'}>
            <div class="mt-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="h5 fw-bold mb-0">
                  Notes ({notes().length})
                </h3>
                <div class="d-flex gap-2">
                  <button 
                    class="btn btn-primary btn-sm"
                    onClick={() => props.onAddNote?.(item.item, item.type)}
                  >
                    <i class="fa fa-plus me-1"></i>
                    Add Note
                  </button>
                  <Show when={notes().length > 0}>
                    <button 
                      class="btn btn-outline-secondary btn-sm"
                      onClick={() => props.onAISummary?.(item.item)}
                    >
                      <i class="fa fa-magic me-1"></i>
                      AI Summary
                    </button>
                  </Show>
                </div>
              </div>

              <div>
                <Show 
                  when={notes().length > 0}
                  fallback={
                    <div class="text-center py-5 text-muted">
                      <i class="fa fa-sticky-note" style="font-size: 3rem; opacity: 0.3;"></i>
                      <p class="mt-3">No notes yet. Add your first note to get started.</p>
                    </div>
                  }
                >
                  <For each={notes()}>
                    {(note) => (
                      <div class="card mb-3 border shadow-sm card-hover">
                        <div class="card-body">
                          <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <small class="text-muted">
                                <i class="fa fa-clock me-1"></i>
                                {formatDate(note.createdAt)}
                              </small>
                              <Show when={note.updatedAt !== note.createdAt}>
                                <small class="text-muted ms-2">
                                  <i class="fa fa-edit me-1"></i>
                                  Updated: {formatDate(note.updatedAt)}
                                </small>
                              </Show>
                            </div>
                            <div class="d-flex gap-1">
                              <button 
                                class="btn btn-sm btn-outline-secondary"
                                style="padding: 4px 8px;"
                                onClick={() => props.onEditNote?.(note)}
                                title="Edit note"
                              >
                                <i class="fa fa-edit"></i>
                              </button>
                              <button 
                                class="btn btn-sm btn-outline-danger"
                                style="padding: 4px 8px;"
                                onClick={() => props.onDeleteNote?.(note)}
                                title="Delete note"
                              >
                                <i class="fa fa-trash"></i>
                              </button>
                            </div>
                          </div>
                          
                          <div class="mb-3">
                            <p class="mb-0 lh-base">{note.content}</p>
                          </div>
                          
                          <Show when={note.tags && note.tags.length > 0}>
                            <div class="d-flex flex-wrap gap-2">
                              <For each={note.tags}>
                                {(tag) => (
                                  <span class="badge bg-secondary tag-chip-custom">{tag}</span>
                                )}
                              </For>
                            </div>
                          </Show>
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
              </div>
            </div>
          </Show>
        </div>
      </div>
    );
  };

  return (
    <main class="flex-fill p-4 overflow-auto bg-light">
      <div class="container-fluid">
        <Show when={!props.selectedItem} fallback={<ItemDetails />}>
          <WelcomeMessage />
        </Show>
      </div>
    </main>
  );
}
