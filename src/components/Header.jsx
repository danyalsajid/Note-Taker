import { createSignal } from "solid-js";

export default function Header({ user, onLogout, onSearch, isMobile, sidebarExpanded, setSidebarExpanded }) {
  const [searchQuery, setSearchQuery] = createSignal("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery());
  };

  return (
    <header class="header bg-white border-bottom shadow-sm">
      <div class="container-fluid">
        <div class="row align-items-center py-2">
          {/* Mobile sidebar toggle */}
          {isMobile() && (
            <div class="col-auto">
              <button
                class="btn btn-outline-secondary btn-sm"
                onClick={() => setSidebarExpanded(!sidebarExpanded())}
              >
                <i class="bi bi-list"></i>
              </button>
            </div>
          )}
          
          {/* Title */}
          <div class="col-auto">
            <h4 class="mb-0 text-primary fw-bold">Healthcare Notes</h4>
          </div>
          
          {/* Search Bar */}
          <div class="col">
            <form onSubmit={handleSearch} class="d-flex justify-content-center">
              <div class="input-group" style="max-width: 400px;">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Search notes..."
                  value={searchQuery()}
                  onInput={(e) => setSearchQuery(e.target.value)}
                />
                <button class="btn btn-outline-secondary" type="submit">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </form>
          </div>
          
          {/* User Info and Logout */}
          <div class="col-auto">
            <div class="d-flex align-items-center">
              <div class="dropdown">
                <button
                  class="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <div class="user-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                       style="width: 32px; height: 32px; font-size: 14px;">
                    {user().name.charAt(0)}
                  </div>
                  <div class="text-start d-none d-md-block">
                    <div class="fw-semibold" style="font-size: 14px;">{user().name}</div>
                    <div class="text-muted" style="font-size: 12px;">{user().role}</div>
                  </div>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <div class="dropdown-item-text">
                      <div class="fw-semibold">{user().name}</div>
                      <div class="text-muted small">{user().role}</div>
                      <div class="text-muted small">{user().email}</div>
                    </div>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <button class="dropdown-item" onClick={onLogout}>
                      <i class="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
