import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';

export default function EntryModal({ editingEntry, onSave, onClose }) {
  const { t } = useLang();
  const [date, setDate] = useState('');
  const [place, setPlace] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date || '');
      setPlace(editingEntry.place || '');
      setFrom(editingEntry.from || '');
      setTo(editingEntry.to || '');
      setHours(editingEntry.hours || '');
      setNotes(editingEntry.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setPlace('');
      setFrom('');
      setTo('');
      setHours('');
      setNotes('');
    }
    setError('');
  }, [editingEntry]);

  const handleSave = () => {
    if (!date || !place || !hours) {
      setError(t('errFieldsRequired'));
      return;
    }
    if (parseFloat(hours) <= 0 || parseFloat(hours) > 24) {
      setError(t('errHoursRange'));
      return;
    }
    setError('');
    onSave({ date, place, from, to, hours, notes });
  };

  const close = () => {
    setError('');
    onClose();
  };

  return (
    <div className={'modal-overlay open'} id="modal-entry" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal-sheet">
        <div className="modal-handle"></div>
        <div className="modal-title">
          {editingEntry ? t('modalEditEntry') : t('modalAddEntry')}
        </div>
        <div className="field">
          <label>{t('labelDate')}</label>
          <input type="date" className="light-input" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label>{t('labelPlace')}</label>
          <input type="text" className="light-input" placeholder={t('placeholderPlace')} value={place} onChange={e => setPlace(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label>{t('labelFrom')}</label>
            <input type="text" className="light-input" placeholder="08:00" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="field">
            <label>{t('labelTo')}</label>
            <input type="text" className="light-input" placeholder="17:00" value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>{t('labelHours')}</label>
          <input type="number" className="light-input" placeholder="8" min="0" max="24" step="0.5" value={hours} onChange={e => setHours(e.target.value)} />
        </div>
        <div className="field">
          <label>{t('labelNotes')}</label>
          <textarea className="light-input" placeholder={t('placeholderNotes')} value={notes} onChange={e => setNotes(e.target.value)}></textarea>
        </div>
        {error && <div className="error-msg show">{error}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={close}>{t('btnCancel')}</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave}>{t('btnSave')}</button>
        </div>
      </div>
    </div>
  );
}
