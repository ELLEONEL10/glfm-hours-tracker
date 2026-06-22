import { useState } from 'react';
import { useLang } from '../context/LangContext';

export default function UserModal({ onSave, onClose }) {
  const { t } = useLang();
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!fullname || !username || !password) {
      setError(t('errAllRequired'));
      return;
    }
    if (password.length < 6) {
      setError(t('errPwdLength'));
      return;
    }
    setError('');
    onSave({ fullname, username, password, role });
  };

  const close = () => {
    setError('');
    onClose();
  };

  return (
    <div className={'modal-overlay open'} id="modal-user" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal-sheet">
        <div className="modal-handle"></div>
        <div className="modal-title">{t('modalNewUser')}</div>
        <div className="field">
          <label>{t('labelFullname')}</label>
          <input type="text" className="light-input" placeholder={t('placeholderFullname')} value={fullname} onChange={e => setFullname(e.target.value)} />
        </div>
        <div className="field">
          <label>{t('labelUsername')}</label>
          <input type="text" className="light-input" autoCapitalize="none" placeholder={t('placeholderUsernameNew')} value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="field">
          <label>{t('labelPassword')}</label>
          <input type="password" className="light-input" placeholder={t('placeholderPasswordNew')} value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="field">
          <label>{t('labelRole')}</label>
          <select className="light-input" value={role} onChange={e => setRole(e.target.value)}>
            <option value="employee">{t('roleEmployee')}</option>
            <option value="admin">{t('roleAdmin')}</option>
          </select>
        </div>
        {error && <div className="error-msg show">{error}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={close}>{t('btnCancel')}</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave}>{t('btnCreateUser')}</button>
        </div>
      </div>
    </div>
  );
}
