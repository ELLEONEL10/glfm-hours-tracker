import { useLang } from '../context/LangContext';
import { initials } from '../utils/storage';

export default function AdminPage({ users, currentUser, onDeleteUser, onAddUser }) {
  const { t } = useLang();

  return (
    <div className="page" id="page-admin">
      <div className="admin-header">
        <h2>{t('adminBadge')}</h2>
        <h1>{t('adminTitle')}</h1>
      </div>
      <div className="section-header">
        <h2>{t('allUsers')}</h2>
        <button className="btn btn-ghost btn-sm" onClick={onAddUser}>{t('btnNewUser')}</button>
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
            <div>
              {u.id !== currentUser.id ? (
                <button className="btn btn-danger" onClick={() => onDeleteUser(u.id)}>Entfernen</button>
              ) : (
                <span style={{ fontSize: '0.72rem', color: 'var(--mid)' }}>{t('you')}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
