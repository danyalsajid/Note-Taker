import { createSignal } from 'solid-js';
import Modal from './Modal';

export default function AddChildModal(props) {
  const [name, setName] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);

  const getChildType = () => {
    const typeMap = {
      'root': 'organization',
      'organization': 'team',
      'team': 'client',
      'client': 'episode'
    };
    return typeMap[props.parentType] || 'item';
  };

  const getChildTypeLabel = () => {
    const labels = {
      'organization': 'Organization',
      'team': 'Team',
      'client': 'Client',
      'episode': 'Episode'
    };
    return labels[getChildType()] || 'Item';
  };

  const getPlaceholder = () => {
    const placeholders = {
      'organization': 'Enter organization name (e.g., City General Hospital)',
      'team': 'Enter team name (e.g., Cardiology Department)',
      'client': 'Enter client name (e.g., John Smith)',
      'episode': 'Enter episode name (e.g., Follow-up Consultation)'
    };
    return placeholders[getChildType()] || 'Enter name';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name().trim()) return;

    setIsLoading(true);
    
    const childData = {
      name: name().trim(),
      type: getChildType(),
      parentId: props.parent?.id || null,
      parentType: props.parentType
    };

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      props.onSave?.(childData);
      handleClose();
    }, 500);
  };

  const handleClose = () => {
    setName('');
    props.onClose?.();
  };

  const getIcon = () => {
    const icons = {
      'organization': 'fa fa-hospital',
      'team': 'fa fa-users',
      'client': 'fa fa-user',
      'episode': 'fa fa-clipboard'
    };
    return icons[getChildType()] || 'fa fa-file';
  };

  const getParentInfo = () => {
    if (props.parentType === 'root') {
      return 'Add a new organization to the system.';
    }
    return `Add a new ${getChildType()} to "${props.parent?.name}".`;
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={handleClose}
      title={`Add New ${getChildTypeLabel()}`}
      size="medium"
    >
      <form onSubmit={handleSubmit}>
        <div class="text-center mb-4">
          <i class={`${getIcon()} text-primary mb-3`} style="font-size: 3rem;"></i>
          <p class="text-muted">{getParentInfo()}</p>
        </div>

        <div class="mb-3">
          <label for="child-name" class="form-label fw-medium">
            {getChildTypeLabel()} Name *
          </label>
          <input
            id="child-name"
            type="text"
            class="form-control"
            placeholder={getPlaceholder()}
            value={name()}
            onInput={(e) => setName(e.target.value)}
            required
            autofocus
          />
        </div>

        <div class="bg-light p-3 rounded mb-4">
          <div class="d-flex align-items-center mb-2">
            <i class="fa fa-clock text-primary me-2"></i>
            <span>Created: {new Date().toLocaleDateString()}</span>
          </div>
          {props.parent && (
            <div class="d-flex align-items-center">
              <i class="fa fa-link text-primary me-2"></i>
              <span>Parent: {props.parent.name}</span>
            </div>
          )}
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
            disabled={isLoading() || !name().trim()}
          >
            {isLoading() ? (
              <>
                <span class="spinner-border spinner-border-sm me-2"></span>
                Creating...
              </>
            ) : (
              `Create ${getChildTypeLabel()}`
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
