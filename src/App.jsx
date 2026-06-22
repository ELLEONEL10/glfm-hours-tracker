import { useState, useEffect, useCallback } from 'react';
import { LangProvider, useLang } from './context/LangContext';
import { loadUsers, saveUsers, hashPwd, loadSession, clearSession, saveSession, loadEntries, saveEntries } from './utils/storage';
import { useUsers } from './hooks/useUsers';
import { useEntries } from './hooks/useEntries';
import { useToast } from './utils/useToast';
import Login from './components/Login';
import TopNav from './components/TopNav';
import TabBar from './components/TabBar';
import Dashboard from './components/Dashboard';
import ExportPage from './components/ExportPage';
import AdminPage from './components/AdminPage';
import EntryModal from './components/EntryModal';
import UserModal from './components/UserModal';
import Toast from './components/Toast';

// Seed admin
(function seed() {
  try {
    const users = loadUsers();
    if (!users.find(u => u.username === 'admin')) {
      users.push({
        id: 'u_admin',
        username: 'admin',
        password: hashPwd('Admin@GLFM2025'),
        fullname: 'Administrator',
        role: 'admin',
        created: new Date().toISOString()
      });
      saveUsers(users);
    }
  } catch (e) {}
})();

function AppContent() {
  const { t } = useLang();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingEntry, setEditingEntry] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const { toast, showToast } = useToast();

  const { users, createUser, deleteUser } = useUsers();
  const { entries, getMyEntries, saveEntry, deleteEntry, refreshEntries } = useEntries(currentUser);

  // Auto-login
  useEffect(() => {
    const s = loadSession();
    if (s) {
      const u = loadUsers().find(x => x.id === s.id);
      if (u) setCurrentUser(u);
    }
  }, []);

  const handleLogin = useCallback((user) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setActiveTab('dashboard');
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleDateChange = useCallback((date) => {
    setCurrentDate(date);
  }, []);

  const handleOpenAddEntry = useCallback(() => {
    setEditingEntry(null);
    setShowEntryModal(true);
  }, []);

  const handleEditEntry = useCallback((entry) => {
    setEditingEntry(entry);
    setShowEntryModal(true);
  }, []);

  const handleSaveEntry = useCallback((data) => {
    saveEntry(data, editingEntry);
    setShowEntryModal(false);
    setEditingEntry(null);
    showToast(editingEntry ? t('toastEntryUpdated') : t('toastEntrySaved'), 'ok');
  }, [saveEntry, editingEntry, showToast, t]);

  const handleDeleteEntry = useCallback((entry) => {
    if (!confirm(t('confirmDeleteEntry'))) return;
    deleteEntry(entry.id);
    showToast(t('toastEntryDeleted'));
  }, [deleteEntry, showToast, t]);

  const handleCloseEntryModal = useCallback(() => {
    setShowEntryModal(false);
    setEditingEntry(null);
  }, []);

  const handleAddUser = useCallback(() => {
    setShowUserModal(true);
  }, []);

  const handleSaveUser = useCallback((data) => {
    const result = createUser(data);
    if (result.error) {
      showToast(t(result.error), 'err');
      return;
    }
    setShowUserModal(false);
    showToast(`${t('toastUserCreated')}: @${data.username}`, 'ok');
  }, [createUser, showToast, t]);

  const handleDeleteUser = useCallback((id) => {
    if (!confirm(t('confirmDeleteUser'))) return;
    const remainingUsers = loadUsers().filter(u => u.id !== id);
    saveUsers(remainingUsers);
    saveEntries(loadEntries().filter(e => e.userId !== id));
    deleteUser(id);
    showToast(t('toastUserRemoved'));
  }, [deleteUser, showToast, t]);

  const handleCloseUserModal = useCallback(() => {
    setShowUserModal(false);
  }, []);

  if (!currentUser) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toast toast={toast} />
      </>
    );
  }

  return (
    <div className="app">
      <TopNav currentUser={currentUser} onLogout={handleLogout} />
      <div className="page-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            entries={entries}
            currentUser={currentUser}
            currentDate={currentDate}
            onDateChange={handleDateChange}
            onAddEntry={handleOpenAddEntry}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        )}
        {activeTab === 'export' && (
          <ExportPage
            entries={entries}
            currentUser={currentUser}
            currentDate={currentDate}
            showToast={showToast}
          />
        )}
        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <AdminPage
            users={users}
            currentUser={currentUser}
            onDeleteUser={handleDeleteUser}
            onAddUser={handleAddUser}
          />
        )}
      </div>
      <TabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isAdmin={currentUser.role === 'admin'}
      />
      {showEntryModal && (
        <EntryModal
          editingEntry={editingEntry}
          onSave={handleSaveEntry}
          onClose={handleCloseEntryModal}
        />
      )}
      {showUserModal && (
        <UserModal
          onSave={handleSaveUser}
          onClose={handleCloseUserModal}
        />
      )}
      <Toast toast={toast} />
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppContent />
    </LangProvider>
  );
}
