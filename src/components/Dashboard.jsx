import { monthKey, fmtHrs } from '../utils/storage';
import { useLang } from '../context/LangContext';

function EntryCard({ entry, monthsShort, onEdit, onDelete }) {
  const d = new Date(entry.date + 'T12:00:00');
  return (
    <div className="entry-card fade-in">
      <div className="entry-date-badge">
        <div className="day">{d.getDate()}</div>
        <div className="mon">{monthsShort[d.getMonth()]}</div>
      </div>
      <div className="entry-info">
        <div className="entry-place">{entry.place}</div>
        <div className="entry-range">
          {entry.from || ''}{entry.from && entry.to ? ' – ' : ''}{entry.to || ''}
        </div>
        <div className="entry-hours">{fmtHrs(entry.hours)} h</div>
        {entry.notes && (
          <div style={{ fontSize: '0.72rem', color: 'var(--mid)', marginTop: 4 }}>{entry.notes}</div>
        )}
      </div>
      <div className="entry-actions">
        <button className="entry-act-btn" onClick={() => onEdit(entry)}>✏️</button>
        <button className="entry-act-btn del" onClick={() => onDelete(entry)}>🗑</button>
      </div>
    </div>
  );
}

export default function Dashboard({ entries, currentUser, currentDate, onDateChange, onAddEntry, onEditEntry, onDeleteEntry }) {
  const { t } = useLang();
  const months = t('MONTHS');
  const monthsShort = t('MONTHS_SHORT');

  const key = monthKey(currentDate);
  const filtered = entries
    .filter(e => e.userId === currentUser?.id && e.monthKey === key)
    .sort((a, b) => a.date.localeCompare(b.date));
  const totalHrs = filtered.reduce((s, e) => s + (parseFloat(e.hours) || 0), 0);

  return (
    <div className="page active" id="page-dashboard">
      <div className="month-selector">
        <button className="month-nav" onClick={() => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>‹</button>
        <div>
          <div className="month-label">{months[currentDate.getMonth()]}</div>
          <div className="month-year">{currentDate.getFullYear()}</div>
        </div>
        <button className="month-nav" onClick={() => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>›</button>
      </div>
      <div className="stats-row">
        <div className="stat-card accent">
          <div className="stat-val">{fmtHrs(totalHrs)}</div>
          <div className="stat-label">{t('statHours')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{filtered.length}</div>
          <div className="stat-label">{t('statDays')}</div>
        </div>
      </div>
      <div className="section-header">
        <h2>{t('sectionEntries')}</h2>
        <button className="btn btn-ghost btn-sm" onClick={onAddEntry}>{t('btnAddDay')}</button>
      </div>
      <div className="entry-list">
        {!filtered.length ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">📋</div>
            <h3>{t('emptyTitle')}</h3>
            <p>{t('emptyDesc')}</p>
          </div>
        ) : (
          filtered.map(entry => (
            <EntryCard
              key={entry.id}
              entry={entry}
              monthsShort={monthsShort}
              onEdit={onEditEntry}
              onDelete={onDeleteEntry}
            />
          ))
        )}
      </div>
    </div>
  );
}
