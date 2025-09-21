import { createSignal, For } from 'solid-js';
import Modal from './Modal';
import { getAllTags } from '../../data/seedData';

export default function AddNoteModal(props) {
  const [content, setContent] = createSignal('');
  const [selectedTags, setSelectedTags] = createSignal([]);
  const [customTag, setCustomTag] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [availableTags] = createSignal(getAllTags());

  const toggleTag = (tagName) => {
    const current = selectedTags();
    if (current.includes(tagName)) {
      setSelectedTags(current.filter(t => t !== tagName));
    } else {
      setSelectedTags([...current, tagName]);
    }
  };

  const addCustomTag = () => {
    const tag = customTag().trim();
    if (tag && !selectedTags().includes(tag)) {
      setSelectedTags([...selectedTags(), tag]);
      setCustomTag('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content().trim()) return;

    setIsLoading(true);
    
    const noteData = {
      content: content().trim(),
      tags: selectedTags(),
      episodeId: props.episode?.id
    };

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      props.onSave?.(noteData);
      handleClose();
    }, 500);
  };

  const handleClose = () => {
    setContent('');
    setSelectedTags([]);
    setCustomTag('');
    props.onClose?.();
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={handleClose}
      title="Add New Note"
      size="large"
    >
      <form onSubmit={handleSubmit}>
        <div class="mb-3">
          <label for="note-content" class="form-label fw-medium">Note Content *</label>
          <textarea
            id="note-content"
            class="form-control"
            placeholder="Enter your note content..."
            rows="6"
            value={content()}
            onInput={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div class="mb-4">
          <label class="form-label fw-medium">Tags</label>
          
          <div class="mb-3">
            <h6 class="text-muted mb-2">Available tags:</h6>
            <div class="d-flex flex-wrap gap-2">
              <For each={availableTags()}>
                {(tag) => (
                  <button
                    type="button"
                    class={`btn btn-sm ${selectedTags().includes(tag.name) ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => toggleTag(tag.name)}
                  >
                    {tag.name}
                  </button>
                )}
              </For>
            </div>
          </div>

          <div class="mb-3">
            <h6 class="text-muted mb-2">Add custom tag:</h6>
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                placeholder="Enter custom tag"
                value={customTag()}
                onInput={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              />
              <button
                type="button"
                class="btn btn-outline-secondary"
                onClick={addCustomTag}
                disabled={!customTag().trim()}
              >
                <i class="fa fa-plus"></i>
              </button>
            </div>
          </div>

          <Show when={selectedTags().length > 0}>
            <div>
              <h6 class="text-muted mb-2">Selected tags:</h6>
              <div class="d-flex flex-wrap gap-2">
                <For each={selectedTags()}>
                  {(tag) => (
                    <span class="badge bg-primary d-flex align-items-center">
                      {tag}
                      <button
                        type="button"
                        class="btn-close btn-close-white ms-2"
                        style="font-size: 0.6em;"
                        onClick={() => toggleTag(tag)}
                      ></button>
                    </span>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button
            type="button"
            class="btn btn-secondary"
            onClick={handleClose}
            disabled={isLoading()}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            disabled={isLoading() || !content().trim()}
          >
            {isLoading() ? (
              <>
                <span class="spinner-border spinner-border-sm me-2"></span>
                Adding...
              </>
            ) : (
              'Add Note'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
