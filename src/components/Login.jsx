import { useState } from 'react';
import { loadUsers, hashPwd, saveSession } from '../utils/storage';
import { useLang } from '../context/LangContext';
import logoSrc from '../full-logo.png';

export default function Login({ onLogin }) {
  const { t, lang, setLang } = useLang();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const doLogin = () => {
    const un = username.trim().toLowerCase();
    if (!un || !password) { setError(t('loginError')); return; }
    const user = loadUsers().find(
      u => u.username.toLowerCase() === un && u.password === hashPwd(password)
    );
    if (!user) { setError(t('loginError')); setPassword(''); return; }
    saveSession(user);
    onLogin(user);
  };

  return (
    <div id="screen-login">
      <div className="login-box">
        <div className="login-logo">
          <img className="logo-img" src={logoSrc} alt="GLFM" />
          <h1>GLFM</h1>
          <p>{t('appSubtitle')}</p>
        </div>
        <div className="login-form">
          <h2>{t('loginTitle')}</h2>
          <p>{t('loginSub')}</p>
          <div className="field">
            <label>{t('labelUsername')}</label>
            <input
              type="text"
              placeholder={t('placeholderUsername')}
              autoComplete="username"
              autoCapitalize="none"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doLogin()}
            />
          </div>
          <div className="field">
            <label>{t('labelPassword')}</label>
            <input
              type="password"
              placeholder={t('placeholderPassword')}
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doLogin()}
            />
            <div className={'error-msg' + (error ? ' show' : '')}>{error}</div>
          </div>
          <button className="btn btn-primary" onClick={doLogin}>{t('btnLogin')}</button>
        </div>
        <div className="lang-switch">
          <button className={'lang-btn' + (lang === 'de' ? ' active' : '')} onClick={() => setLang('de')}>DE</button>
          <button className={'lang-btn' + (lang === 'en' ? ' active' : '')} onClick={() => setLang('en')}>EN</button>
        </div>
      </div>
    </div>
  );
}
