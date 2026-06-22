import { useState } from 'react';
import { signIn } from '../firebase/auth';
import { useLang } from '../context/LangContext';
import logoSrc from '../full-logo.png';

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

export default function Login() {
  const { t, lang, setLang } = useLang();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const doLogin = async () => {
    const un = username.trim().toLowerCase();
    if (!un || !password) { setError(t('loginError')); return; }
    setBusy(true);
    setError('');
    try {
      await signIn(un, password);
    } catch (err) {
      setError(err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential'
        ? t('loginError') : t('loginError'));
      setPassword('');
      setBusy(false);
    }
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
            <div className="pwd-wrap">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder={t('placeholderPassword')}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doLogin()}
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPwd(!showPwd)}
                tabIndex={-1}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                <EyeIcon show={showPwd} />
              </button>
            </div>
            <div className={'error-msg' + (error ? ' show' : '')}>{error}</div>
          </div>
          <button className="btn btn-primary" onClick={doLogin} disabled={busy}>
            {busy ? '…' : t('btnLogin')}
          </button>
        </div>
        <div className="lang-switch">
          <button className={'lang-btn' + (lang === 'de' ? ' active' : '')} onClick={() => setLang('de')}>DE</button>
          <button className={'lang-btn' + (lang === 'en' ? ' active' : '')} onClick={() => setLang('en')}>EN</button>
        </div>
      </div>
    </div>
  );
}
