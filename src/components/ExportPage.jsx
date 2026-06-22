import { useState, useCallback, useEffect } from 'react';
import SignaturePad from './SignaturePad';
import { exportPDF } from '../utils/pdf';
import { monthKey } from '../utils/storage';
import { useLang } from '../context/LangContext';
import logoSrc from '../full-logo.png';

export default function ExportPage({ entries, currentUser, currentDate, showToast }) {
  const { t, lang } = useLang();
  const months = t('MONTHS');

  const myEntries = entries.filter(e => e.userId === currentUser?.id);
  const keys = [...new Set([monthKey(currentDate), ...myEntries.map(e => e.monthKey)])].sort().reverse();

  const [selMonth, setSelMonth] = useState(monthKey(currentDate));
  const [sigDataURL, setSigDataURL] = useState(null);
  const [logoDataURL, setLogoDataURL] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      setLogoDataURL(c.toDataURL('image/png'));
    };
    img.src = logoSrc;
  }, []);

  const sigHasContent = useCallback(() => {
    if (!sigDataURL) return false;
    return sigDataURL.length > 2000;
  }, [sigDataURL]);

  const handleExport = () => {
    if (!selMonth) { showToast(t('toastSelectMonth'), 'err'); return; }
    const filtered = myEntries.filter(e => e.monthKey === selMonth).sort((a, b) => a.date.localeCompare(b.date));
    if (!filtered.length) { showToast(t('toastNoEntries'), 'err'); return; }
    if (!sigHasContent()) { showToast(t('toastNeedSig'), 'err'); return; }
    exportPDF(filtered, currentUser, selMonth, sigDataURL, logoDataURL, lang, t);
    showToast(t('toastPdfDownloaded'), 'ok');
  };

  return (
    <div className="page" id="page-export">
      <div className="section-header" style={{ marginBottom: 20 }}>
        <h2>{t('tabExport')}</h2>
      </div>
      <div className="export-card">
        <h3>{t('exportTitle')}</h3>
        <p>{t('exportDesc')}</p>
        <div className="field">
          <label>{t('labelMonth')}</label>
          <select className="light-input" value={selMonth} onChange={e => setSelMonth(e.target.value)}>
            {keys.map(k => {
              const [y, m] = k.split('-');
              return <option key={k} value={k}>{months[parseInt(m) - 1]} {y}</option>;
            })}
          </select>
        </div>
      </div>
      <div className="export-card">
        <h3>{t('sigTitle')}</h3>
        <p>{t('sigDesc')}</p>
        <SignaturePad sigDataURL={sigDataURL} onSigChange={setSigDataURL} />
        <div className="sig-actions">
          <div>
            <span className={'sig-status ' + (sigHasContent() ? 'signed' : 'empty')}>
              {sigHasContent() ? t('sigSigned') : t('sigEmpty')}
            </span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setSigDataURL(null)}>{t('btnClearSig')}</button>
        </div>
        <button className="btn btn-primary" onClick={handleExport}>{t('btnExport')}</button>
      </div>
    </div>
  );
}
