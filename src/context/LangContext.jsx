import { createContext, useContext, useState, useEffect } from 'react';
import TRANSLATIONS from '../utils/translations';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('glfm_lang') || 'de');

  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem('glfm_lang', l);
  };

  const t = (key) => (TRANSLATIONS[lang] || TRANSLATIONS.de)[key] || key;

  const MONTHS = () => t('MONTHS');
  const MONTHS_SHORT = () => t('MONTHS_SHORT');

  return (
    <LangContext.Provider value={{ lang, setLang, t, MONTHS, MONTHS_SHORT }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}

export default LangContext;
