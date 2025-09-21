import { createSignal, For, Show } from 'solid-js';

export default function Header(props) {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [selectedTags, setSelectedTags] = createSignal(new Set());
  const [user] = createSignal({
    name: 'Dr. Sarah Johnson',
    role: 'Admin'
  });
  const [tags] = createSignal([
    { id: 1, name: 'Assessment' },
    { id: 2, name: 'Follow-up' },
    { id: 3, name: 'Medication' },
    { id: 4, name: 'Urgent' },
    { id: 5, name: 'Routine' }
  ]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    props.onSearch?.(query);
  };

  const toggleTag = (tagId) => {
    const selected = selectedTags();
    const newSelected = new Set(selected);
    
    if (newSelected.has(tagId)) {
      newSelected.delete(tagId);
    } else {
      newSelected.add(tagId);
    }
    
    setSelectedTags(newSelected);
    props.onTagFilter?.(Array.from(newSelected));
  };

  const clearAllTags = () => {
    setSelectedTags(new Set());
    props.onTagFilter?.([]);
  };

  const getBreadcrumbs = () => {
    if (!props.selectedItem) return [];
    
    const breadcrumbs = [];
    const { item, type, hierarchy } = props.selectedItem;
    
    if (hierarchy) {
      hierarchy.forEach((hierarchyItem, index) => {
        breadcrumbs.push({
          name: hierarchyItem.name,
          type: hierarchyItem.type,
          item: hierarchyItem,
          isLast: false
        });
      });
    }
    
    breadcrumbs.push({
      name: item.name,
      type: type,
      item: item,
      isLast: true
    });
    
    return breadcrumbs;
  };

  const handleBreadcrumbClick = (breadcrumbItem) => {
    props.onBreadcrumbClick?.(breadcrumbItem.item, breadcrumbItem.type);
  };

  return (
    <header class="bg-white border-bottom shadow-sm">
      <div class="container-fluid p-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="d-flex align-items-center">
            <h1 class="h4 mb-0 me-4 fw-bold text-primary">
              <i class="fa fa-clipboard-list me-2"></i>
              Healthcare Notes
            </h1>
            
            <div class="position-relative">
              <div class="input-group" style="width: 350px;">
                <span class="input-group-text bg-light border-end-0">
                  <i class="fa fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  class="form-control border-start-0 search-input-focus"
                  placeholder="Search notes..."
                  value={searchQuery()}
                  onInput={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div class="d-flex align-items-center">
            <div class="me-3">
              <div class="fw-medium" style="font-size: 0.9rem;">{user().name}</div>
              <small class="text-muted">{user().role}</small>
            </div>
            <button 
              class="btn btn-outline-danger btn-sm d-flex align-items-center"
              onClick={props.onLogout}
              title="Logout"
            >
              <i class="fa fa-sign-out-alt me-1"></i>
              <span class="d-none d-md-inline">Logout</span>
            </button>
          </div>
        </div>

        <div>
        <nav class="mb-3">
          <Show when={getBreadcrumbs().length > 0}>
            <ol class="breadcrumb mb-0">
              <For each={getBreadcrumbs()}>
                {(breadcrumb, index) => (
                  <li class={`breadcrumb-item ${breadcrumb.isLast ? 'active' : ''}`}>
                    {breadcrumb.isLast ? (
                      breadcrumb.name
                    ) : (
                      <button
                        class="btn btn-link p-0 text-decoration-none"
                        onClick={() => handleBreadcrumbClick(breadcrumb)}
                      >
                        {breadcrumb.name}
                      </button>
                    )}
                  </li>
                )}
              </For>
            </ol>
          </Show>
        </nav>

        <div>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-medium">Filter by tags:</span>
            <Show when={selectedTags().size > 0}>
              <button class="btn btn-link btn-sm p-0" onClick={clearAllTags}>
                Clear all
              </button>
            </Show>
          </div>
          
          <div class="d-flex flex-wrap gap-2">
            <For each={tags()}>
              {(tag) => (
                <button
                  class={`btn btn-sm tag-chip-custom ${selectedTags().has(tag.id) ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  <i class="fa fa-tag me-1" style="font-size: 0.8rem;"></i>
                  {tag.name}
                  <Show when={selectedTags().has(tag.id)}>
                    <i class="fa fa-times ms-2" style="font-size: 0.8rem;"></i>
                  </Show>
                </button>
              )}
            </For>
          </div>
        </div>
      </div>
      </div>
    </header>
  );
}
