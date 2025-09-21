import { createSignal, Show } from "solid-js";

export default function DeleteConfirmModal({ isOpen, onClose, item, onConfirm, type = "item" }) {
  const [loading, setLoading] = createSignal(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(item());
      onClose();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getItemTypeName = (item) => {
    if (!item) return type;
    
    switch (item.type) {
      case 'organization': return 'organization';
      case 'team': return 'department/team';
      case 'client': return 'patient';
      case 'episode': return 'episode';
      default: return type;
    }
  };

  const getWarningMessage = (item) => {
    if (!item) return "";
    
    if (item.children && item.children.length > 0) {
      return `This ${getItemTypeName(item)} has ${item.children.length} child item(s). Deleting it will also delete all its children.`;
    }
    
    return "";
  };

  return (
    <Show when={isOpen() && item()}>
      <div class="modal show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Confirm Deletion
              </h5>
              <button
                type="button"
                class="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>
            
            <div class="modal-body">
              <div class="text-center mb-3">
                <i class="bi bi-trash display-4 text-danger"></i>
              </div>
              
              <p class="text-center mb-3">
                Are you sure you want to delete this {getItemTypeName(item())}?
              </p>
              
              <div class="alert alert-light border">
                <strong>{item().name}</strong>
                {item().date && (
                  <small class="text-muted d-block">Date: {item().date}</small>
                )}
                {item().text && (
                  <small class="text-muted d-block">
                    "{item().text.substring(0, 100)}{item().text.length > 100 ? '...' : ''}"
                  </small>
                )}
              </div>

              {getWarningMessage(item()) && (
                <div class="alert alert-warning">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  <strong>Warning:</strong> {getWarningMessage(item())}
                </div>
              )}

              <p class="text-muted text-center">
                <small>This action cannot be undone.</small>
              </p>
            </div>
            
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                onClick={onClose}
                disabled={loading()}
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-danger"
                onClick={handleConfirm}
                disabled={loading()}
              >
                {loading() ? (
                  <>
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i class="bi bi-trash me-1"></i>
                    Delete {getItemTypeName(item())}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
