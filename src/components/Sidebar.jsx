import { createSignal, For, onMount, createEffect } from "solid-js";
import apiService from "../services/api";

export default function Sidebar({ 
  isExpanded, 
  setIsExpanded, 
  selectedItem, 
  setSelectedItem, 
  onAddChild,
  isMobile 
}) {
  // Hierarchy data from API
  const [hierarchyData, setHierarchyData] = createSignal([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);

  // Load hierarchy data on mount
  onMount(async () => {
    await loadHierarchy();
  });

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getHierarchy();
      setHierarchyData(data);
    } catch (err) {
      console.error('Failed to load hierarchy:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'organisation': 
      case 'organization': 
        return <i class="fas fa-hospital text-primary me-2"></i>;
      case 'team': 
        return <i class="fas fa-users text-success me-2"></i>;
      case 'client': 
        return <i class="fas fa-user text-info me-2"></i>;
      case 'episode': 
        return <i class="fas fa-clipboard-list text-warning me-2"></i>;
      default: 
        return <i class="fas fa-file text-secondary me-2"></i>;
    }
  };

  const renderTreeItem = (item, level = 0) => {
    const isSelected = selectedItem()?.id === item.id;
    
    return (
      <div class="tree-item">
        <div
          class={`tree-item-content d-flex align-items-center justify-content-between p-2 ${
            isSelected ? 'bg-primary text-white' : 'hover-bg-light'
          }`}
          style={`padding-left: ${level * 20 + 10}px !important; cursor: pointer;`}
          onClick={() => setSelectedItem(item)}
        >
          <div class="d-flex align-items-center">
            {getItemIcon(item.type)}
            <span class="tree-item-name">{item.name}</span>
            {item.date && <small class="ms-2 opacity-75">({item.date})</small>}
          </div>
          <button
            class={`btn btn-sm ${isSelected ? 'btn-light' : 'btn-outline-primary'}`}
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(item);
            }}
            title="Add Child"
          >
            <i class="bi bi-plus"></i>
          </button>
        </div>
        
        {item.children && item.children.length > 0 && (
          <div class="tree-children">
            <For each={item.children}>
              {(child) => renderTreeItem(child, level + 1)}
            </For>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      class={`sidebar bg-white border-end ${
        isMobile() ? (isExpanded() ? 'sidebar-mobile-expanded' : 'sidebar-mobile-collapsed') 
                  : (isExpanded() ? 'sidebar-expanded' : 'sidebar-collapsed')
      }`}
    >
      <div class="sidebar-header d-flex align-items-center justify-content-between p-3 border-bottom">
        <h6 class="mb-0 fw-bold">Organizations</h6>
        <button
          class="btn btn-sm btn-outline-secondary"
          onClick={() => setIsExpanded(!isExpanded())}
          title={isExpanded() ? "Collapse" : "Expand"}
        >
          <i class={`bi ${isExpanded() ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
        </button>
      </div>
      
      <div class="sidebar-content overflow-auto">
        <div class="p-2">
          <button
            class="btn btn-primary btn-sm w-100 mb-3"
            onClick={() => onAddChild(null)}
          >
            <i class="bi bi-plus me-1"></i>
            Add Organization
          </button>
        </div>
        
        <div class="tree-container">
          {loading() ? (
            <div class="text-center p-3">
              <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <div class="mt-2 small text-muted">Loading hierarchy...</div>
            </div>
          ) : error() ? (
            <div class="alert alert-danger m-2">
              <i class="fas fa-exclamation-triangle me-2"></i>
              {error()}
              <button 
                class="btn btn-sm btn-outline-danger mt-2 w-100"
                onClick={loadHierarchy}
              >
                <i class="fas fa-redo me-1"></i>
                Retry
              </button>
            </div>
          ) : (
            <For each={hierarchyData()}>
              {(item) => renderTreeItem(item)}
            </For>
          )}
        </div>
      </div>
    </div>
  );
}
