import { useState } from 'react';
import { useLang } from '../context/LangContext';
import { monthKey, fmtHrs, initials } from '../utils/storage';

function EyeIcon({ show }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {show ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );
}

export default function AdminPage({ users, entries, currentUser, currentDate, onDateChange, onDeleteUser, onResetPassword, onAddUser }) {
  const { t } = useLang();
  const [view, setView] = useState('users');
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);

  const months = t('MONTHS');

  const openForm = () => {
    setUsername('');
    setFullname('');
    setPassword('');
    setRole('employee');
    setShowPwd(false);
    setShowModal(true);
  };

  const doAddUser = async () => {
    const un = username.trim().toLowerCase();
    const fn = fullname.trim();
    if (!un || !fn || !password) return;
    setBusy(true);
    await onAddUser({ username: un, fullname: fn, password, role });
    setBusy(false);
    setShowModal(false);
  };

  const key = monthKey(currentDate);
  const userMap = {};
  users.forEach(u => { userMap[u.id] = u; });

  const teamEntries = entries.filter(e => e.monthKey === key);
  const userHours = {};
  teamEntries.forEach(e => {
    userHours[e.userId] = (userHours[e.userId] || 0) + (parseFloat(e.hours) || 0);
  });

  const totalTeamHours = Object.values(userHours).reduce((s, v) => s + v, 0);

  return (
    <div className="page" id="page-admin">
      <div className="admin-header">
        <h2>{t('adminBadge')}</h2>
        <h1>{t('adminTitle')}</h1>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={'btn btn-sm ' + (view === 'users' ? 'btn-primary' : 'btn-ghost')} onClick={() => setView('users')}>
          {t('allUsers')}
        </button>
        <button className={'btn btn-sm ' + (view === 'overview' ? 'btn-primary' : 'btn-ghost')} onClick={() => setView('overview')}>
          {t('adminOverview')}
        </button>
      </div>

      {view === 'users' && (
        <>
          <div className="section-header">
            <h2>{t('allUsers')}</h2>
            <button className="btn btn-primary btn-sm" onClick={openForm}>
              {t('btnAddUser')}
            </button>
          </div>
          <div id="user-list">
            {users.map(u => (
              <div className="user-row fade-in" key={u.id}>
                <div className="user-av">{initials(u.fullname)}</div>
                <div className="user-info">
                  <div className="user-name">{u.fullname}</div>
                  <div className="user-role-txt">
                    @{u.username}
                    <span className={'badge ' + (u.role === 'admin' ? 'badge-gold' : 'badge-gray')} style={{ marginLeft: 4 }}>
                      {u.role === 'admin' ? t('roleAdmin') : t('roleEmployee')}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {u.id !== currentUser.id ? (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => onResetPassword(u.username)}>{t('btnResetPwd')}</button>
                      <button className="btn btn-danger" onClick={() => onDeleteUser(u.id)}>Entfernen</button>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--mid)' }}>{t('you')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showModal && (
            <div className={'modal-overlay open'} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
              <div className="modal-sheet">
                <div className="modal-handle"></div>
                <div className="modal-title">{t('btnAddUser')}</div>
                <div className="field">
                  <label>{t('labelUsername')}</label>
                  <input type="text" className="light-input" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
                <div className="field">
                  <label>{t('labelFullname')}</label>
                  <input type="text" className="light-input" value={fullname} onChange={e => setFullname(e.target.value)} />
                </div>
                <div className="field">
                  <label>{t('labelPassword')}</label>
                  <div className="pwd-wrap">
                    <input type={showPwd ? 'text' : 'password'} className="light-input" value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                      <EyeIcon show={showPwd} />
                    </button>
                  </div>
                </div>
                <div className="field">
                  <label>{t('labelRole')}</label>
                  <select className="light-input" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="employee">{t('roleEmployee')}</option>
                    <option value="admin">{t('roleAdmin')}</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>{t('btnCancel')}</button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={doAddUser} disabled={busy}>
                    {busy ? '…' : t('btnCreate')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {view === 'overview' && (
        <>
          <div className="month-selector" style={{ marginBottom: 16 }}>
            <button className="month-nav" onClick={() => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>‹</button>
            <div>
              <div className="month-label">{months[currentDate.getMonth()]}</div>
              <div className="month-year">{currentDate.getFullYear()}</div>
            </div>
            <button className="month-nav" onClick={() => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>›</button>
          </div>
          <div className="stats-row">
            <div className="stat-card accent">
              <div className="stat-val">{fmtHrs(totalTeamHours)}</div>
              <div className="stat-label">{t('statHours')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">{users.length}</div>
              <div className="stat-label">{t('statEmployees')}</div>
            </div>
          </div>
          <div className="section-header">
            <h2>{t('adminOverview')}</h2>
          </div>
          <div id="user-list">
            {users.map(u => {
              const hrs = userHours[u.id] || 0;
              return (
                <div className="user-row fade-in" key={u.id}>
                  <div className="user-av">{initials(u.fullname)}</div>
                  <div className="user-info">
                    <div className="user-name">{u.fullname}</div>
                    <div className="user-role-txt">
                      @{u.username}
                      <span className={'badge ' + (u.role === 'admin' ? 'badge-gold' : 'badge-gray')} style={{ marginLeft: 4 }}>
                        {u.role === 'admin' ? t('roleAdmin') : t('roleEmployee')}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: hrs > 0 ? 'var(--accent)' : 'var(--mid)' }}>{fmtHrs(hrs)} h</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
