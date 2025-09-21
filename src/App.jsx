import { createSignal, Show } from "solid-js";
import AuthContainer from "./components/auth/AuthContainer";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import MainContent from "./components/layout/MainContent";
import AddNoteModal from "./components/modals/AddNoteModal";
import EditNoteModal from "./components/modals/EditNoteModal";
import DeleteConfirmationModal from "./components/modals/DeleteConfirmationModal";
import AISummaryModal from "./components/modals/AISummaryModal";
import AddChildModal from "./components/modals/AddChildModal";
import "./styles.css";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);
  const [selectedItem, setSelectedItem] = createSignal(null);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedTags, setSelectedTags] = createSignal([]);
  
  // Modal states
  const [showAddNoteModal, setShowAddNoteModal] = createSignal(false);
  const [showEditNoteModal, setShowEditNoteModal] = createSignal(false);
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);
  const [showAISummaryModal, setShowAISummaryModal] = createSignal(false);
  const [showAddChildModal, setShowAddChildModal] = createSignal(false);
  
  // Modal data
  const [currentNote, setCurrentNote] = createSignal(null);
  const [currentEpisode, setCurrentEpisode] = createSignal(null);
  const [deleteTarget, setDeleteTarget] = createSignal(null);
  const [addChildParent, setAddChildParent] = createSignal(null);

  // Authentication handlers
  const handleLogin = (credentials) => {
    console.log("Login attempt:", credentials);
    // Simulate successful login
    setIsAuthenticated(true);
  };

  const handleSignup = (userData) => {
    console.log("Signup attempt:", userData);
    // Simulate successful signup
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedItem(null);
  };

  // Navigation handlers
  const handleItemSelect = (item, type) => {
    setSelectedItem({ item, type });
  };

  const handleBreadcrumbClick = (item, type) => {
    setSelectedItem({ item, type });
  };

  // Search and filter handlers
  const handleSearch = (query) => {
    setSearchQuery(query);
    console.log("Search query:", query);
  };

  const handleTagFilter = (tags) => {
    setSelectedTags(tags);
    console.log("Selected tags:", tags);
  };

  // Note handlers
  const handleAddNote = (item, type) => {
    // For now, we'll only allow notes on episodes, but this can be extended
    if (type === 'episode') {
      setCurrentEpisode(item);
      setShowAddNoteModal(true);
    } else {
      // For other types, we could show a message or handle differently
      console.log(`Adding note to ${type}:`, item);
      setCurrentEpisode(item);
      setShowAddNoteModal(true);
    }
  };

  const handleEditNote = (note) => {
    setCurrentNote(note);
    setShowEditNoteModal(true);
  };

  const handleDeleteNote = (note) => {
    setDeleteTarget({ item: note, type: 'note' });
    setShowDeleteModal(true);
  };

  const handleSaveNote = (noteData) => {
    console.log("Save note:", noteData);
    // Here you would typically save to your data store
    setShowAddNoteModal(false);
    setShowEditNoteModal(false);
    setCurrentNote(null);
    setCurrentEpisode(null);
  };

  // Item management handlers
  const handleEditItem = (item, type) => {
    console.log("Edit item:", item, type);
    // Implement edit functionality
  };

  const handleDeleteItem = (item, type) => {
    setDeleteTarget({ item, type });
    setShowDeleteModal(true);
  };

  const handleAddChild = (parent, parentType) => {
    setAddChildParent({ parent, parentType });
    setShowAddChildModal(true);
  };

  const handleSaveChild = (childData) => {
    console.log("Save child:", childData);
    // Here you would typically save to your data store
    setShowAddChildModal(false);
    setAddChildParent(null);
  };

  // AI Summary handler
  const handleAISummary = (episode) => {
    setCurrentEpisode(episode);
    setShowAISummaryModal(true);
  };

  // Delete confirmation handler
  const handleConfirmDelete = () => {
    const target = deleteTarget();
    console.log("Delete confirmed:", target);
    // Here you would typically delete from your data store
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // Close modal handlers
  const closeModals = () => {
    setShowAddNoteModal(false);
    setShowEditNoteModal(false);
    setShowDeleteModal(false);
    setShowAISummaryModal(false);
    setShowAddChildModal(false);
    setCurrentNote(null);
    setCurrentEpisode(null);
    setDeleteTarget(null);
    setAddChildParent(null);
  };

  return (
    <Show
      when={isAuthenticated()}
      fallback={
        <AuthContainer
          onLogin={handleLogin}
          onSignup={handleSignup}
        />
      }
    >
      <div class="d-flex vh-100">
        <Sidebar
          selectedItem={selectedItem()}
          onItemSelect={handleItemSelect}
          onAddChild={handleAddChild}
          onAddNote={handleAddNote}
        />
        
        <div class="flex-fill d-flex flex-column">
          <Header
            selectedItem={selectedItem()}
            onSearch={handleSearch}
            onTagFilter={handleTagFilter}
            onBreadcrumbClick={handleBreadcrumbClick}
            onLogout={handleLogout}
          />
          
          <MainContent
            selectedItem={selectedItem()}
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
      <AddNoteModal
        isOpen={showAddNoteModal()}
        episode={currentEpisode()}
        onSave={handleSaveNote}
        onClose={closeModals}
      />

      <EditNoteModal
        isOpen={showEditNoteModal()}
        note={currentNote()}
        onSave={handleSaveNote}
        onClose={closeModals}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal()}
        item={deleteTarget()?.item}
        itemType={deleteTarget()?.type}
        onConfirm={handleConfirmDelete}
        onClose={closeModals}
      />

      <AISummaryModal
        isOpen={showAISummaryModal()}
        episode={currentEpisode()}
        onClose={closeModals}
      />

      <AddChildModal
        isOpen={showAddChildModal()}
        parent={addChildParent()?.parent}
        parentType={addChildParent()?.parentType}
        onSave={handleSaveChild}
        onClose={closeModals}
      />
    </Show>
  );
}
