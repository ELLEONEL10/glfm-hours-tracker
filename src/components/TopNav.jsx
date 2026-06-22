import { useState, useEffect } from 'react';
import { initials } from '../utils/storage';
import { useLang } from '../context/LangContext';
import logoSrc from '../full-logo.png';

export default function TopNav({ currentUser, onLogout }) {
  const { t } = useLang();
  const [dark, setDark] = useState(() => localStorage.getItem('glfm_dark') === '1');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('glfm_dark', dark ? '1' : '0');
  }, [dark]);

  return (
    <nav className="topnav">
      <div className="nav-brand">
        <img className="nav-logo-img" src={logoSrc} alt="GLFM" />
        <div>
          <div className="nav-title">{currentUser.fullname.split(' ')[0]}</div>
          <div className="nav-sub">
            {currentUser.role === 'admin' ? t('navRoleAdmin') : t('navRoleEmployee')}
          </div>
        </div>
      </div>
      <div className="nav-right">
        <button className="icon-btn" onClick={() => setDark(!dark)} title={dark ? 'Light' : 'Dark'}>
          {dark ? '☀️' : '🌙'}
        </button>
        <div className="avatar">{initials(currentUser.fullname)}</div>
        <button className="icon-btn" onClick={onLogout} title="Abmelden">⏏</button>
      </div>
    </nav>
  );
}
