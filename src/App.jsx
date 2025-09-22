import { createSignal, createEffect, onMount, Show } from "solid-js";
import apiService from "./services/api";
import AuthContainer from "./components/AuthContainer";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import AddChildModal from "./components/AddChildModal";
import AddNoteModal from "./components/AddNoteModal";
import EditNoteModal from "./components/EditNoteModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import AISummaryModal from "./components/AISummaryModal";

export default function App() {
  // Authentication state
  const [user, setUser] = createSignal(null);
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);

  // UI state
  const [isMobile, setIsMobile] = createSignal(false);
  const [sidebarExpanded, setSidebarExpanded] = createSignal(true);
  const [selectedItem, setSelectedItem] = createSignal(null);

  // Modal states
  const [showAddChildModal, setShowAddChildModal] = createSignal(false);
  const [showAddNoteModal, setShowAddNoteModal] = createSignal(false);
  const [showEditNoteModal, setShowEditNoteModal] = createSignal(false);
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);
  const [showAISummaryModal, setShowAISummaryModal] = createSignal(false);

  // Modal data
  const [modalData, setModalData] = createSignal(null);

  // Check if mobile on mount and resize
  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
    if (window.innerWidth <= 768) {
      setSidebarExpanded(false);
    }
  };

  // Monitor authentication state changes
  createEffect(() => {
    console.log("App.jsx - Authentication effect triggered:", { 
      isAuthenticated: isAuthenticated(), 
      user: user() 
    });
  });

  onMount(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Initialize Bootstrap tooltips and dropdowns
    if (typeof window !== 'undefined' && window.bootstrap) {
      // Initialize Bootstrap components
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new window.bootstrap.Tooltip(tooltipTriggerEl);
      });
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  });

  // Authentication handlers
  const handleLogin = (userData) => {
    console.log("App.jsx - handleLogin called with:", userData);
    setUser(userData);
    setIsAuthenticated(true);
    console.log("App.jsx - Authentication state updated:", { user: userData, isAuthenticated: true });
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setSelectedItem(null);
  };

  // Search handler
  const handleSearch = (query) => {
    console.log("Searching for:", query);
    // Implement search functionality
  };

  // Child management handlers
  const handleAddChild = (parentItem) => {
    setModalData(parentItem);
    setShowAddChildModal(true);
  };

  const handleSaveChild = async (newItem, parentItem) => {
    try {
      console.log("Adding child:", newItem, "to parent:", parentItem);
      
      const nodeData = {
        name: newItem.name,
        type: newItem.type,
        parentId: parentItem?.id || null
      };
      
      await apiService.createHierarchyNode(nodeData);
      
      // Refresh the sidebar data by triggering a re-render
      // The sidebar will reload its data automatically
      setShowAddChildModal(false);
      
      // Force sidebar refresh by updating selected item
      if (parentItem) {
        setSelectedItem({ ...parentItem });
      }
    } catch (error) {
      console.error("Failed to add child:", error);
      alert(error.message || "Failed to add item. Please try again.");
    }
  };

  // Note management handlers
  const handleAddNote = (item) => {
    setModalData(item);
    setShowAddNoteModal(true);
  };

  const handleSaveNote = async (note) => {
    try {
      console.log("Saving note:", note);
      
      const noteData = {
        content: note.content,
        attachedToId: note.attachedToId,
        attachedToType: note.attachedToType,
        tags: note.tags || []
      };
      
      await apiService.createNote(noteData);
      setShowAddNoteModal(false);
      
      // Refresh the main content to show the new note
      if (selectedItem()) {
        setSelectedItem({ ...selectedItem() });
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      alert(error.message || "Failed to save note. Please try again.");
    }
  };

  const handleEditNote = (note) => {
    setModalData(note);
    setShowEditNoteModal(true);
  };

  const handleUpdateNote = async (updatedNote) => {
    try {
      console.log("Updating note:", updatedNote);
      
      const noteData = {
        content: updatedNote.content,
        tags: updatedNote.tags || []
      };
      
      await apiService.updateNote(updatedNote.id, noteData);
      setShowEditNoteModal(false);
      
      // Refresh the main content to show the updated note
      if (selectedItem()) {
        setSelectedItem({ ...selectedItem() });
      }
    } catch (error) {
      console.error("Failed to update note:", error);
      alert(error.message || "Failed to update note. Please try again.");
    }
  };

  const handleDeleteNote = (note) => {
    setModalData(note);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (item) => {
    try {
      console.log("Deleting:", item);
      
      if (item.content) {
        // It's a note
        await apiService.deleteNote(item.id);
      } else {
        // It's a hierarchy node
        await apiService.deleteHierarchyNode(item.id);
        setSelectedItem(null); // Clear selection if we deleted the selected item
      }
      
      setShowDeleteModal(false);
      
      // Refresh the UI
      if (selectedItem() && selectedItem().id !== item.id) {
        setSelectedItem({ ...selectedItem() });
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert(error.message || "Failed to delete item. Please try again.");
    }
  };

  // Item management handlers
  const handleEditItem = async (item) => {
    try {
      const newName = prompt("Enter new name:", item.name);
      if (newName && newName.trim() && newName.trim() !== item.name) {
        await apiService.updateHierarchyNode(item.id, { name: newName.trim() });
        
        // Refresh the UI
        if (selectedItem() && selectedItem().id === item.id) {
          setSelectedItem({ ...item, name: newName.trim() });
        }
      }
    } catch (error) {
      console.error("Failed to edit item:", error);
      alert(error.message || "Failed to edit item. Please try again.");
    }
  };

  const handleDeleteItem = (item) => {
    setModalData(item);
    setShowDeleteModal(true);
  };

  // AI Summary handler
  const handleAISummary = (item, notes) => {
    setModalData({ item, notes });
    setShowAISummaryModal(true);
  };

  return (
    <Show
      when={isAuthenticated()}
      fallback={<AuthContainer onLogin={handleLogin} />}
    >
      <div class="app-container">
        <div class="main-layout">
          <Sidebar
            isExpanded={sidebarExpanded}
            setIsExpanded={setSidebarExpanded}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onAddChild={handleAddChild}
            isMobile={isMobile}
          />
          
          <div class="content-area">
            <Header
              user={user}
              onLogout={handleLogout}
              onSearch={handleSearch}
              isMobile={isMobile}
              sidebarExpanded={sidebarExpanded}
              setSidebarExpanded={setSidebarExpanded}
            />
            
            <MainContent
              selectedItem={selectedItem}
              onAddNote={handleAddNote}
              onEditNote={handleEditNote}
              onDeleteNote={handleDeleteNote}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onAISummary={handleAISummary}
            />
          </div>
        </div>

        {/* Modals */}
        <AddChildModal
          isOpen={showAddChildModal}
          onClose={() => setShowAddChildModal(false)}
          parentItem={modalData}
          onSave={handleSaveChild}
        />

        <AddNoteModal
          isOpen={showAddNoteModal}
          onClose={() => setShowAddNoteModal(false)}
          selectedItem={modalData}
          onSave={handleSaveNote}
        />

        <EditNoteModal
          isOpen={showEditNoteModal}
          onClose={() => setShowEditNoteModal(false)}
          note={modalData}
          onSave={handleUpdateNote}
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          item={modalData}
          onConfirm={handleConfirmDelete}
        />

        <AISummaryModal
          isOpen={showAISummaryModal}
          onClose={() => setShowAISummaryModal(false)}
          selectedItem={() => modalData()?.item}
          notes={() => modalData()?.notes}
        />

        {/* Mobile sidebar overlay */}
        {isMobile() && sidebarExpanded() && (
          <div
            class="position-fixed w-100 h-100"
            style="background-color: rgba(0,0,0,0.5); z-index: 1040; top: 0; left: 0;"
            onClick={() => setSidebarExpanded(false)}
          ></div>
        )}
      </div>
    </Show>
  );
}
