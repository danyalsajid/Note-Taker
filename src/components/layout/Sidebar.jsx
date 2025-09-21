import { createSignal, For, Show } from 'solid-js';
import { 
  getOrganizations, 
  getTeamsByOrganization, 
  getClientsByTeam, 
  getEpisodesByClient 
} from '../../data/seedData';

export default function Sidebar(props) {
  const [sidebarExpanded, setSidebarExpanded] = createSignal(false);
  const [organizations] = createSignal(getOrganizations());

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded());
  };

  const handleItemClick = (item, type) => {
    props.onItemSelect?.(item, type);
  };

  const handleAddChild = (parentItem, parentType) => {
    props.onAddChild?.(parentItem, parentType);
  };

  const getChildType = (parentType) => {
    const typeMap = {
      'organization': 'team',
      'team': 'client',
      'client': 'episode'
    };
    return typeMap[parentType];
  };

  const SidebarItem = (props) => {
    const { item, type, level = 0 } = props;
    
    const getChildren = () => {
      switch (type) {
        case 'organization':
          return getTeamsByOrganization(item.id).map(child => ({ item: child, type: 'team' }));
        case 'team':
          return getClientsByTeam(item.id).map(child => ({ item: child, type: 'client' }));
        case 'client':
          return getEpisodesByClient(item.id).map(child => ({ item: child, type: 'episode' }));
        default:
          return [];
      }
    };

    const getIcon = () => {
      switch (type) {
        case 'organization':
          return 'fa fa-hospital text-danger';
        case 'team':
          return 'fa fa-users text-info';
        case 'client':
          return 'fa fa-user text-warning';
        case 'episode':
          return 'fa fa-clipboard text-success';
        default:
          return 'fa fa-file text-secondary';
      }
    };

    return (
      <div>
        <div 
          class={`d-flex align-items-center justify-content-between py-1 px-2 mx-1 rounded cursor-pointer sidebar-item-hover ${props.selectedItem?.id === item.id ? 'sidebar-item-selected' : ''}`}
          style={`margin-left: ${level * 12 + 4}px !important; font-size: 0.85rem;`}
          onClick={() => handleItemClick(item, type)}
        >
          <div class="d-flex align-items-center flex-grow-1">
            <i class={`${getIcon()} me-2`} style="font-size: 0.8rem;"></i>
            <span class="fw-medium text-truncate">{item.name}</span>
          </div>
          
          <div class="d-flex gap-1">
            <Show when={type !== 'episode'}>
              <button
                class="btn btn-sm btn-outline-primary opacity-75"
                style="padding: 1px 4px; font-size: 0.6rem;"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddChild(item, type);
                }}
                title={`Add ${getChildType(type)}`}
              >
                <i class="fa fa-plus"></i>
              </button>
            </Show>
            
            <button
              class="btn btn-sm btn-outline-success opacity-75"
              style="padding: 1px 4px; font-size: 0.6rem;"
              onClick={(e) => {
                e.stopPropagation();
                props.onAddNote?.(item, type);
              }}
              title="Add Note"
            >
              <i class="fa fa-sticky-note"></i>
            </button>
          </div>
        </div>

        <div>
          <For each={getChildren()}>
            {(child) => (
              <SidebarItem 
                item={child.item} 
                type={child.type} 
                level={level + 1}
                selectedItem={props.selectedItem}
                onAddNote={props.onAddNote}
              />
            )}
          </For>
        </div>
      </div>
    );
  };

  return (
    <div class={`bg-white border-end shadow-sm d-flex flex-column ${sidebarExpanded() ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      <div class="d-flex justify-content-between align-items-center p-2 border-bottom bg-light">
        <button
          class="btn btn-outline-secondary btn-sm me-2"
          onClick={toggleSidebar}
          title={sidebarExpanded() ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          <i class={`fa ${sidebarExpanded() ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
        </button>
        
        <Show when={sidebarExpanded()}>
          <h6 class="mb-0 fw-bold text-primary flex-grow-1">
            <i class="fa fa-sitemap me-2"></i>
            Healthcare Hierarchy
          </h6>
          <button
            class="btn btn-primary btn-sm btn-icon"
            onClick={() => handleAddChild(null, 'root')}
            title="Add Organization"
          >
            <i class="fa fa-plus"></i>
          </button>
        </Show>
      </div>

      <div class="flex-grow-1 overflow-auto">
        <div class="py-2">
          <For each={organizations()}>
            {(org) => (
              <SidebarItem 
                item={org} 
                type="organization" 
                selectedItem={props.selectedItem}
                onAddNote={props.onAddNote}
              />
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
