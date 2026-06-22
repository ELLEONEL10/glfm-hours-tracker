import { useState, useEffect, useCallback } from 'react';
import { LangProvider, useLang } from './context/LangContext';
import { onAuthChange, logOut, resetPassword, signUp } from './firebase/auth';
import { getUserDoc, createUserDoc } from './firebase/db';
import { hasConfig } from './firebase/config';
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
import Toast from './components/Toast';

function SetupScreen() {
  const { t } = useLang();
  return (
    <div id="screen-login">
      <div className="login-box" style={{ textAlign: 'center' }}>
        <div className="login-logo">
          <h1 style={{ color: 'white', fontSize: '2rem' }}>GLFM</h1>
          <p style={{ color: '#8A8A8A', marginTop: 8 }}>{t('appSubtitle')}</p>
        </div>
        <div className="login-form">
          <h2>Firebase not configured</h2>
          <p style={{ marginBottom: 16 }}>
            Create a <code style={{ color: '#C8A96E' }}>.env</code> file in the project root with your
            Firebase project config. See <code style={{ color: '#C8A96E' }}>.env.example</code> for the required variables.
          </p>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { t } = useLang();
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingEntry, setEditingEntry] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const { toast, showToast } = useToast();

  const { users, deleteUser } = useUsers();
  const { entries, saveEntry, deleteEntry } = useEntries();

  useEffect(() => {
    if (!hasConfig) {
      setCheckingAuth(false);
      return;
    }
    const unsub = onAuthChange(async (authUser) => {
      if (authUser) {
        try {
          const docSnap = await getUserDoc(authUser.uid);
          if (docSnap && docSnap.exists()) {
            const data = docSnap.data();
            setCurrentUser({
              id: authUser.uid,
              uid: authUser.uid,
              email: authUser.email,
              username: data.username,
              fullname: data.fullname,
              role: data.role,
              created: data.created,
            });
          } else {
            setCurrentUser(null);
          }
        } catch (err) {
          console.error('Failed to load profile:', err);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setCheckingAuth(false);
    });
    return unsub;
  }, []);

  const handleLogout = useCallback(() => {
    logOut();
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
    saveEntry(data, editingEntry, currentUser);
    setShowEntryModal(false);
    setEditingEntry(null);
    showToast(editingEntry ? t('toastEntryUpdated') : t('toastEntrySaved'), 'ok');
  }, [saveEntry, editingEntry, currentUser, showToast, t]);

  const handleDeleteEntry = useCallback((entry) => {
    if (!confirm(t('confirmDeleteEntry'))) return;
    deleteEntry(entry.id);
    showToast(t('toastEntryDeleted'));
  }, [deleteEntry, showToast, t]);

  const handleCloseEntryModal = useCallback(() => {
    setShowEntryModal(false);
    setEditingEntry(null);
  }, []);

  const handleResetPassword = useCallback(async (username) => {
    try {
      await resetPassword(username);
      showToast(t('toastPwdReset'), 'ok');
    } catch (err) {
      showToast(err.message || t('loginError'), 'err');
    }
  }, [showToast, t]);

  const handleDeleteUser = useCallback((id) => {
    if (!confirm(t('confirmDeleteUser'))) return;
    entries.filter(e => e.userId === id).forEach(e => deleteEntry(e.id));
    deleteUser(id);
    showToast(t('toastUserRemoved'));
  }, [deleteUser, deleteEntry, entries, showToast, t]);

  const handleAddUser = useCallback(async ({ username, fullname, password, role }) => {
    try {
      const cred = await signUp(username, password);
      await createUserDoc(cred.user.uid, { username, fullname, role });
      showToast(t('toastUserCreated'), 'ok');
    } catch (err) {
      showToast(err.message || t('loginError'), 'err');
    }
  }, [showToast, t]);

  if (!hasConfig) {
    return <SetupScreen />;
  }

  if (checkingAuth) {
    return null;
  }

  if (!currentUser) {
    return (
      <>
        <Login />
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
            entries={entries}
            currentUser={currentUser}
            currentDate={currentDate}
            onDateChange={handleDateChange}
            onDeleteUser={handleDeleteUser}
            onResetPassword={handleResetPassword}
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
