import { useState, useMemo } from 'react';
import { useLang } from '../context/LangContext';
import { initials } from '../utils/storage';

const DAY_KEYS = ['shiftSun','shiftMon','shiftTue','shiftWed','shiftThu','shiftFri','shiftSat'];

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function dayLabels(t) {
  return DAY_KEYS.map(k => t(k));
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
}

function formatDayRange(days, labels) {
  return days.map(d => labels[d]).join(', ');
}

function ScheduleCard({ shift, labels, onEdit, onDelete, users }) {
  const { t } = useLang();
  const assignedUsers = users.filter(u => shift.assignedEmployees?.includes(u.id));
  const jokerUsers = users.filter(u => shift.jokers?.includes(u.id));

  return (
    <div className="shift-card fade-in">
      <div className="shift-date-badge" style={{ minWidth: 52 }}>
        <div className="day">{formatDate(shift.startDate)}</div>
        <div className="mon">–</div>
        <div className="day" style={{ fontSize: '0.85rem' }}>{formatDate(shift.endDate)}</div>
      </div>
      <div className="shift-info">
        <div className="shift-place">{shift.place}</div>
        <div className="shift-range">
          {shift.from || ''}{shift.from && shift.to ? ' – ' : ''}{shift.to || ''}
        </div>
        {shift.daysOfWeek?.length > 0 && (
          <div className="shift-days-row">
            <span className="shift-days-label">{t('shiftWeeklyPattern')}:</span>
            {shift.daysOfWeek.sort().map(d => (
              <span key={d} className="shift-day-chip">{labels[d]}</span>
            ))}
          </div>
        )}
        {assignedUsers.length > 0 && (
          <div className="shift-employees">
            {t('shiftAssignedTo')} {assignedUsers.map(u => u.fullname).join(', ')}
          </div>
        )}
        {jokerUsers.length > 0 && (
          <div className="shift-joker-label">
            {t('shiftJokerLabel')} {jokerUsers.map(u => u.fullname).join(', ')}
          </div>
        )}
        {shift.notes && (
          <div className="shift-notes">{shift.notes}</div>
        )}
      </div>
      <div className="shift-actions">
        <button className="entry-act-btn" onClick={() => onEdit(shift)}>✏️</button>
        <button className="entry-act-btn del" onClick={() => onDelete(shift)}>🗑</button>
      </div>
    </div>
  );
}

export default function ShiftPlanner({ shifts, users, currentUser, onSaveShift, onEditShift, onDeleteShift, showToast, monthsShort }) {
  const { t } = useLang();
  const labels = dayLabels(t);
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(todayStr());
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [place, setPlace] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [jokers, setJokers] = useState([]);
  const [busy, setBusy] = useState(false);

  const sortedShifts = useMemo(() => {
    return [...shifts].sort((a, b) => a.startDate.localeCompare(b.startDate) || a.from?.localeCompare(b.from || ''));
  }, [shifts]);

  const openAdd = () => {
    setEditingShift(null);
    setStartDate(todayStr());
    setEndDate(todayStr());
    setDaysOfWeek([]);
    setPlace('');
    setFrom('');
    setTo('');
    setNotes('');
    setAssignedEmployees([]);
    setJokers([]);
    setShowModal(true);
  };

  const openEdit = (shift) => {
    setEditingShift(shift);
    setStartDate(shift.startDate);
    setEndDate(shift.endDate);
    setDaysOfWeek(shift.daysOfWeek || []);
    setPlace(shift.place);
    setFrom(shift.from || '');
    setTo(shift.to || '');
    setNotes(shift.notes || '');
    setAssignedEmployees(shift.assignedEmployees || []);
    setJokers(shift.jokers || []);
    setShowModal(true);
  };

  const toggleDay = (d) => {
    setDaysOfWeek(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const toggleEmployee = (uid) => {
    setAssignedEmployees(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const toggleJoker = (uid) => {
    setJokers(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const doSave = async () => {
    if (!startDate || !endDate || !place || daysOfWeek.length === 0) return;
    setBusy(true);
    const data = { startDate, endDate, daysOfWeek, place, from, to: to || '', notes: notes || '', assignedEmployees, jokers };

    if (editingShift) {
      await onEditShift(editingShift.id, data);
    } else {
      data.createdBy = currentUser.uid;
      await onSaveShift(data);
    }

    setBusy(false);
    setShowModal(false);
    setEditingShift(null);
    showToast(t('toastShiftSaved'), 'ok');
  };

  const confirmDelete = (shift) => {
    if (!confirm(t('confirmDeleteShift'))) return;
    onDeleteShift(shift.id);
    showToast(t('toastShiftDeleted'));
  };

  const employeeUsers = users.filter(u => u.role === 'employee');

  return (
    <div className="page" id="page-shifts">
      <div className="admin-header">
        <h2>{t('shiftInfo')}</h2>
        <h1>{t('shiftPlanner')}</h1>
      </div>

      <div className="section-header">
        <h2>{t('tabShifts')}</h2>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          {t('btnAddShift')}
        </button>
      </div>

      <div className="shift-list">
        {sortedShifts.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">📅</div>
            <h3>{t('shiftNoShifts')}</h3>
          </div>
        ) : (
          sortedShifts.map(shift => (
            <ScheduleCard
              key={shift.id}
              shift={shift}
              labels={labels}
              onEdit={openEdit}
              onDelete={confirmDelete}
              users={users}
            />
          ))
        )}
      </div>

      {showModal && (
        <div className={'modal-overlay open'} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-sheet">
            <div className="modal-handle"></div>
            <div className="modal-title">{editingShift ? t('btnEditShift') : t('btnAddShift')}</div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>{t('shiftStartDate')}</label>
                <input type="date" className="light-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>{t('shiftEndDate')}</label>
                <input type="date" className="light-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label>{t('shiftDaysOfWeek')}</label>
              <div className="day-picker">
                {labels.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    className={'day-chip' + (daysOfWeek.includes(i) ? ' active' : '')}
                    onClick={() => toggleDay(i)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>{t('shiftPlace')}</label>
              <input type="text" className="light-input" value={place} onChange={e => setPlace(e.target.value)} placeholder={t('placeholderPlace')} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>{t('shiftFrom')}</label>
                <input type="time" className="light-input" value={from} onChange={e => setFrom(e.target.value)} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>{t('shiftTo')}</label>
                <input type="time" className="light-input" value={to} onChange={e => setTo(e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label>{t('shiftNotes')}</label>
              <textarea className="light-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('placeholderNotes')} />
            </div>

            <div className="field">
              <label>{t('shiftEmployees')}</label>
              <div className="shift-assign-list">
                {employeeUsers.map(u => (
                  <label key={u.id} className="shift-assign-row">
                    <input
                      type="checkbox"
                      checked={assignedEmployees.includes(u.id)}
                      onChange={() => toggleEmployee(u.id)}
                    />
                    <span className="user-av-sm">{initials(u.fullname)}</span>
                    <span>{u.fullname}</span>
                  </label>
                ))}
                {employeeUsers.length === 0 && (
                  <p style={{ padding: '8px 0' }}>{t('shiftNoShifts')}</p>
                )}
              </div>
            </div>

            <div className="field">
              <label>{t('shiftJoker')}</label>
              <p style={{ fontSize: '0.75rem', marginBottom: 8 }}>{t('shiftJokerInfo')}</p>
              <div className="shift-assign-list">
                {employeeUsers.map(u => (
                  <label key={u.id} className="shift-assign-row">
                    <input
                      type="checkbox"
                      checked={jokers.includes(u.id)}
                      onChange={() => toggleJoker(u.id)}
                    />
                    <span className="user-av-sm">{initials(u.fullname)}</span>
                    <span>{u.fullname}</span>
                  </label>
                ))}
                {employeeUsers.length === 0 && (
                  <p style={{ padding: '8px 0' }}>{t('shiftNoShifts')}</p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>{t('btnCancel')}</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={doSave} disabled={busy || !startDate || !endDate || !place || daysOfWeek.length === 0}>
                {busy ? '…' : t('btnSaveShift')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
