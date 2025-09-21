import { createSignal, For } from "solid-js";

export default function Sidebar({ 
  isExpanded, 
  setIsExpanded, 
  selectedItem, 
  setSelectedItem, 
  onAddChild,
  isMobile 
}) {
  // Mock hierarchy data
  const [hierarchyData] = createSignal([
    {
      id: 1,
      name: "City General Hospital",
      type: "organization",
      children: [
        {
          id: 2,
          name: "Cardiology Department",
          type: "team",
          children: [
            {
              id: 3,
              name: "John Smith",
              type: "client",
              children: [
                {
                  id: 4,
                  name: "Follow-up Consultation",
                  type: "episode",
                  date: "2024-01-09",
                  children: []
                }
              ]
            },
            {
              id: 5,
              name: "Sarah Johnson",
              type: "client",
              children: [
                {
                  id: 6,
                  name: "Routine Check-up",
                  type: "episode",
                  date: "2024-01-08",
                  children: []
                }
              ]
            }
          ]
        },
        {
          id: 7,
          name: "Emergency Department",
          type: "team",
          children: [
            {
              id: 8,
              name: "Michael Brown",
              type: "client",
              children: []
            }
          ]
        }
      ]
    },
    {
      id: 9,
      name: "Regional Medical Center",
      type: "organization",
      children: [
        {
          id: 10,
          name: "Pediatrics",
          type: "team",
          children: []
        }
      ]
    }
  ]);

  const getItemIcon = (type) => {
    switch (type) {
      case 'organization': return '🏥';
      case 'team': return '👥';
      case 'client': return '👤';
      case 'episode': return '📋';
      default: return '📄';
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
            <span class="me-2">{getItemIcon(item.type)}</span>
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
          <For each={hierarchyData()}>
            {(item) => renderTreeItem(item)}
          </For>
        </div>
      </div>
    </div>
  );
}
