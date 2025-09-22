import { createSignal, createEffect, For, Show } from 'solid-js';
import Modal from './Modal';
import AttachmentsList from './AttachmentsList';

function EditNoteModal(props) {
  const [content, setContent] = createSignal(props.currentContent || '');
  const [tags, setTags] = createSignal([]);
  const [newTag, setNewTag] = createSignal('');
  const [selectedFiles, setSelectedFiles] = createSignal([]);
  const [uploading, setUploading] = createSignal(false);
  
  // Update content and tags when note changes
  createEffect(() => {
    if (props.note) {
      setContent(props.note.content || '');
      setTags(props.note.tags || []);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content().trim()) {
      setUploading(true);
      try {
        await props.onSubmit(content().trim(), tags(), selectedFiles());
        setContent('');
        setTags([]);
        setNewTag('');
        setSelectedFiles([]);
      } catch (error) {
        console.error('Failed to update note:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleClose = () => {
    setContent(props.currentContent || '');
    setTags(props.note?.tags || []);
    setNewTag('');
    setSelectedFiles([]);
    props.onClose();
  };
  
  const addTag = () => {
    const tag = newTag().trim();
    if (tag && !tags().includes(tag)) {
      setTags([...tags(), tag]);
      setNewTag('');
    }
  };
  
  const removeTag = (tagToRemove) => {
    setTags(tags().filter(tag => tag !== tagToRemove));
  };
  
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const removeFile = (index) => {
    const files = selectedFiles();
    files.splice(index, 1);
    setSelectedFiles([...files]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      pdf: 'fas fa-file-pdf text-danger',
      doc: 'fas fa-file-word text-primary',
      docx: 'fas fa-file-word text-primary',
      xls: 'fas fa-file-excel text-success',
      xlsx: 'fas fa-file-excel text-success',
      ppt: 'fas fa-file-powerpoint text-warning',
      pptx: 'fas fa-file-powerpoint text-warning',
      jpg: 'fas fa-file-image text-info',
      jpeg: 'fas fa-file-image text-info',
      png: 'fas fa-file-image text-info',
      gif: 'fas fa-file-image text-info',
      txt: 'fas fa-file-alt text-secondary',
      csv: 'fas fa-file-csv text-success'
    };
    return icons[ext] || 'fas fa-file text-secondary';
  };
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={handleClose}
      title="Edit Note"
    >
      <form onSubmit={handleSubmit}>
        <div class="modal-body">
          <div class="text-center mb-4">
            <i class="fas fa-edit" style="font-size: 2rem; color: #1e40af; margin-bottom: 1rem;"></i>
            <h4 class="mb-2">Edit Note</h4>
            {props.note && (
              <div class="text-muted small">
                <div>
                  <i class="fas fa-calendar me-2"></i>
                  Created: {formatDate(props.note.createdAt)}
                </div>
                {props.note.updatedAt !== props.note.createdAt && (
                  <div class="mt-1">
                    <i class="fas fa-clock me-2"></i>
                    Last updated: {formatDate(props.note.updatedAt)}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div class="mb-3">
            <label class="form-label fw-medium">
              <i class="fas fa-sticky-note me-2"></i>
              Note Content
            </label>
            <textarea
              class="form-control"
              value={content()}
              onInput={(e) => setContent(e.target.value)}
              placeholder="Enter your note here..."
              autofocus
              required
              rows="6"
              style="min-height: 150px; resize: vertical;"
            />
            <div class="form-text">
              <i class="fas fa-info-circle me-1"></i>
              Make your changes and click "Save Changes" to update the note.
            </div>
          </div>
          
          <div class="mb-3">
            <label class="form-label fw-medium">
              <i class="fas fa-tags me-2"></i>
              Tags (Optional)
            </label>
            <div class="input-group mb-2">
              <input
                type="text"
                class="form-control"
                value={newTag()}
                onInput={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add a tag..."
              />
              <button 
                type="button" 
                class="btn btn-outline-primary"
                onClick={addTag}
                disabled={!newTag().trim()}
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <For each={tags()}>
                {(tag) => (
                  <span class="badge bg-primary d-flex align-items-center gap-1">
                    {tag}
                    <button 
                      type="button" 
                      class="btn-close btn-close-white" 
                      style="font-size: 0.7em;"
                      onClick={() => removeTag(tag)}
                      aria-label="Remove tag"
                    ></button>
                  </span>
                )}
              </For>
            </div>
            <div class="form-text">
              <i class="fas fa-info-circle me-1"></i>
              Press Enter or click + to add tags. Tags help organize and filter your notes.
            </div>
          </div>

          <Show when={props.note}>
            <div class="mb-3">
              <label class="form-label fw-medium">
                <i class="fas fa-paperclip me-2"></i>
                Current Attachments
              </label>
              <AttachmentsList noteId={props.note.id} />
            </div>
          </Show>

          <div class="mb-3">
            <label class="form-label fw-medium">
              <i class="fas fa-paperclip me-2"></i>
              Add New Attachments (Optional)
            </label>
            <input
              type="file"
              class="form-control"
              multiple
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
            />
            <div class="form-text">
              <i class="fas fa-info-circle me-1"></i>
              Supported formats: PDF, Word, Excel, PowerPoint, Images, Text files (Max 25MB each)
            </div>
            
            <Show when={selectedFiles().length > 0}>
              <div class="mt-3">
                <div class="fw-medium mb-2">New Files to Upload:</div>
                <div class="list-group">
                  <For each={selectedFiles()}>
                    {(file, index) => (
                      <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                          <i class={getFileIcon(file.name)} style="margin-right: 0.5rem;"></i>
                          <div>
                            <div class="fw-medium">{file.name}</div>
                            <small class="text-muted">{formatFileSize(file.size)}</small>
                          </div>
                        </div>
                        <button
                          type="button"
                          class="btn btn-outline-danger btn-sm"
                          onClick={() => removeFile(index())}
                          title="Remove file"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onClick={handleClose}>
            <i class="fas fa-times me-2"></i>
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" disabled={uploading()}>
            {uploading() ? (
              <>
                <i class="fas fa-spinner fa-spin me-2"></i>
                Saving...
              </>
            ) : (
              <>
                <i class="fas fa-save me-2"></i>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditNoteModal;
