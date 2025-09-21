import { createSignal } from 'solid-js';
import Modal from './Modal';

export default function DeleteConfirmationModal(props) {
  const [isLoading, setIsLoading] = createSignal(false);

  const getItemTypeLabel = (type) => {
    const labels = {
      'organization': 'organization',
      'team': 'team',
      'client': 'client',
      'episode': 'episode',
      'note': 'note'
    };
    return labels[type] || 'item';
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      props.onConfirm?.();
      props.onClose?.();
    }, 500);
  };

  const getWarningMessage = () => {
    return `Are you sure you want to delete this ${getItemTypeLabel(props.itemType)}?`;
  };

  const getIcon = () => {
    return <i class="fa fa-exclamation-triangle text-warning" style="font-size: 3rem;"></i>;
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Confirm Deletion"
      size="small"
    >
      <div class="text-center">
        <div class="mb-4">
          {getIcon()}
          <p class="mt-3 mb-2">{getWarningMessage()}</p>
          <p class="text-muted small">This will also delete all associated child items.</p>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button
            type="button"
            class="btn btn-secondary"
            onClick={props.onClose}
            disabled={isLoading()}
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-danger"
            onClick={handleConfirm}
            disabled={isLoading()}
          >
            {isLoading() ? (
              <>
                <span class="spinner-border spinner-border-sm me-2"></span>
                Deleting...
              </>
            ) : (
              'Delete Permanently'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
