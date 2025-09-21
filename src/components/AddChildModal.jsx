import { createSignal, Show } from "solid-js";

export default function AddChildModal({ isOpen, onClose, parentItem, onSave }) {
  const [formData, setFormData] = createSignal({
    name: "",
    type: "",
    date: ""
  });

  const getChildType = (parentType) => {
    switch (parentType) {
      case 'organization': return 'team';
      case 'team': return 'client';
      case 'client': return 'episode';
      default: return 'item';
    }
  };

  const getChildTypeLabel = (parentType) => {
    switch (parentType) {
      case 'organization': return 'Department/Team';
      case 'team': return 'Patient';
      case 'client': return 'Episode';
      default: return 'Item';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = formData();
    
    if (!data.name.trim()) {
      alert("Name is required!");
      return;
    }

    const newItem = {
      id: Date.now(), // Simple ID generation
      name: data.name,
      type: parentItem ? getChildType(parentItem.type) : 'organization',
      date: data.date || new Date().toISOString().split('T')[0],
      children: []
    };

    onSave(newItem, parentItem);
    setFormData({ name: "", type: "", date: "" });
    onClose();
  };

  const handleClose = () => {
    setFormData({ name: "", type: "", date: "" });
    onClose();
  };

  return (
    <Show when={isOpen()}>
      <div class="modal show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                Add {parentItem ? getChildTypeLabel(parentItem.type) : 'Organization'}
                {parentItem && (
                  <small class="text-muted d-block">
                    to {parentItem.name}
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
                  <label for="itemName" class="form-label">
                    {parentItem ? getChildTypeLabel(parentItem.type) : 'Organization'} Name *
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="itemName"
                    value={formData().name}
                    onInput={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={`Enter ${parentItem ? getChildTypeLabel(parentItem.type).toLowerCase() : 'organization'} name`}
                    required
                  />
                </div>

                {(!parentItem || parentItem.type === 'client') && (
                  <div class="mb-3">
                    <label for="itemDate" class="form-label">
                      {parentItem?.type === 'client' ? 'Episode Date' : 'Date'}
                    </label>
                    <input
                      type="date"
                      class="form-control"
                      id="itemDate"
                      value={formData().date}
                      onInput={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                )}

                <div class="alert alert-info">
                  <i class="bi bi-info-circle me-2"></i>
                  <strong>Hierarchy:</strong> Organization → Department/Team → Patient → Episode
                </div>
              </div>
              
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-plus me-1"></i>
                  Add {parentItem ? getChildTypeLabel(parentItem.type) : 'Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Show>
  );
}
