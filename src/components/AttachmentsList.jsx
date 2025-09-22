import { createSignal, createEffect, For, Show } from 'solid-js';
import { authApiCall } from '../auth';

// API base URL - Dynamic based on current host and protocol
const getApiBase = () => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // If deployed 
  if (hostname.includes('.railway.app')) {
    return `${protocol}//${hostname}/api`;
  }
  
  // For local network
  return `${protocol}//${hostname}:3001/api`;
};
const API_BASE = getApiBase();

function AttachmentsList(props) {
  const [attachments, setAttachments] = createSignal([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);

  // Load attachments when note ID changes
  createEffect(async () => {
    console.log('AttachmentsList effect triggered with noteId:', props.noteId, 'type:', typeof props.noteId);
    if (props.noteId && props.noteId !== 'undefined' && !props.noteId.startsWith('offline-')) {
      console.log('Loading attachments for note ID:', props.noteId);
      await loadAttachments();
    } else {
      console.log('Skipping attachment load for note ID:', props.noteId, 'Reason:', {
        isNull: !props.noteId,
        isUndefined: props.noteId === 'undefined',
        isOffline: props.noteId?.startsWith('offline-')
      });
      setAttachments([]);
    }
  });

  const loadAttachments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Making API call to load attachments for note:', props.noteId);
      const response = await authApiCall(`/notes/${props.noteId}/attachments`);
      console.log('Attachments loaded:', response);
      setAttachments(response || []);
    } catch (err) {
      console.error('Failed to load attachments:', err);
      setError(err.message);
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadAttachment = async (attachmentId, filename) => {
    try {
      console.log('Downloading attachment:', attachmentId, filename);
      const token = localStorage.getItem('healthcare_token');
      const response = await fetch(`${API_BASE}/attachments/${attachmentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download failed with status:', response.status, errorText);
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('Downloaded blob size:', blob.size);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('Download completed successfully');
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Failed to download file: ${error.message}`);
    }
  };

  const deleteAttachment = async (attachmentId) => {
    if (!confirm('Are you sure you want to delete this attachment?')) {
      return;
    }
    
    try {
      await authApiCall(`/attachments/${attachmentId}`, {
        method: 'DELETE'
      });
      
      // Reload attachments
      await loadAttachments();
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      alert('Failed to delete attachment');
    }
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

  return (
    <div>
      <Show when={loading()}>
        <div class="mt-3">
          <div class="d-flex align-items-center text-muted">
            <i class="fas fa-spinner fa-spin me-2"></i>
            Loading attachments...
          </div>
        </div>
      </Show>
      
      <Show when={error()}>
        <div class="mt-3">
          <div class="alert alert-warning py-2">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Failed to load attachments: {error()}
            <button 
              class="btn btn-sm btn-outline-warning ms-2"
              onClick={loadAttachments}
            >
              <i class="fas fa-redo me-1"></i>
              Retry
            </button>
          </div>
        </div>
      </Show>
      
      <Show when={!loading() && !error() && attachments().length > 0}>
        <div class="mt-3">
          <div class="fw-medium mb-2 text-muted">
            <i class="fas fa-paperclip me-1"></i>
            Attachments ({attachments().length})
          </div>
          <div class="list-group list-group-flush">
            <For each={attachments()}>
              {(attachment) => (
                <div class="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center">
                    <i class={getFileIcon(attachment.originalName)} style="margin-right: 0.5rem;"></i>
                    <div>
                      <div class="fw-medium">{attachment.originalName}</div>
                      <small class="text-muted">{formatFileSize(attachment.size)}</small>
                    </div>
                  </div>
                  <div class="d-flex gap-1">
                    <button
                      class="btn btn-outline-primary btn-sm"
                      onClick={() => downloadAttachment(attachment.id, attachment.originalName)}
                      title="Download file"
                    >
                      <i class="fas fa-download"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger btn-sm"
                      onClick={() => deleteAttachment(attachment.id)}
                      title="Delete attachment"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
      
      <Show when={!loading() && !error() && attachments().length === 0 && props.noteId && !props.noteId.startsWith('offline-')}>
        <div class="mt-3">
          <div class="text-muted small">
            <i class="fas fa-paperclip me-1"></i>
            No attachments
          </div>
        </div>
      </Show>
    </div>
  );
}

export default AttachmentsList;
