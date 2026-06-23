import { useMemo } from 'react';
import { useLang } from '../context/LangContext';

function expandOccurrences(shift, userId) {
  const days = shift.daysOfWeek || [];
  if (days.length === 0) return [];
  const start = new Date(shift.startDate + 'T12:00:00');
  const end = new Date(shift.endDate + 'T12:00:00');
  const dates = [];
  const cur = new Date(start);
  let maxIter = 400;
  while (cur <= end && maxIter > 0) {
    maxIter--;
    if (days.includes(cur.getDay())) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      dates.push({
        dateStr: y + '-' + m + '-' + d,
        dateObj: new Date(cur),
        shift,
        role: shift.assignedEmployees?.includes(userId) ? 'assigned' : 'joker',
      });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export default function ShiftView({ shifts, currentUser, users, monthsShort }) {
  const { t } = useLang();

  const occurrences = useMemo(() => {
    const all = [];
    shifts.forEach(s => {
      const isAssigned = s.assignedEmployees?.includes(currentUser.id);
      const isJoker = s.jokers?.includes(currentUser.id);
      if (isAssigned || isJoker) {
        const items = expandOccurrences(s, currentUser.id);
        all.push(...items);
      }
    });
    all.sort((a, b) => a.dateStr.localeCompare(b.dateStr) || a.shift.from?.localeCompare(b.shift.from || ''));
    return all;
  }, [shifts, currentUser]);

  const grouped = useMemo(() => {
    const map = {};
    occurrences.forEach(o => {
      if (!map[o.dateStr]) map[o.dateStr] = [];
      map[o.dateStr].push(o);
    });
    const sorted = Object.keys(map).sort();
    return sorted.map(dateStr => ({ dateStr, items: map[dateStr] }));
  }, [occurrences]);

  const userMap = {};
  users.forEach(u => { userMap[u.id] = u; });

  return (
    <div className="page" id="page-shifts">
      <div className="admin-header" style={{ background: 'var(--white)', border: '1px solid var(--line)' }}>
        <h2 style={{ color: 'var(--mid)' }}>{t('shiftInfo')}</h2>
        <h1 style={{ color: 'var(--black)' }}>{t('tabShiftPlan')}</h1>
      </div>

      <div className="section-header" style={{ marginTop: 20 }}>
        <h2>{t('shiftMyShifts')}</h2>
      </div>

      <div className="shift-list">
        {occurrences.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">📅</div>
            <h3>{t('shiftNoShifts')}</h3>
          </div>
        ) : (
          grouped.map(group => {
            const d = new Date(group.dateStr + 'T12:00:00');
            return (
              <div key={group.dateStr} className="shift-day-group fade-in">
                <div className="shift-day-header">
                  <span className="shift-day-num">{d.getDate()}</span>
                  <span className="shift-day-month">{monthsShort[d.getMonth()]}</span>
                  <span className="shift-day-year">{d.getFullYear()}</span>
                  <span className="shift-day-name">
                    {t(DAY_KEYS[d.getDay()])}
                  </span>
                </div>
                {group.items.map((item, idx) => {
                  const s = item.shift;
                  const colleagues = (s.assignedEmployees || [])
                    .filter(id => id !== currentUser.id)
                    .map(id => userMap[id]?.fullname)
                    .filter(Boolean);
                  const jokerUsers = (s.jokers || []).map(id => userMap[id]).filter(Boolean);
                  return (
                    <div className="shift-instance" key={s.id + '-' + idx}>
                      <div className="shift-instance-info">
                        <div className="shift-place">{s.place}</div>
                        <div className="shift-range">
                          {s.from || ''}{s.from && s.to ? ' – ' : ''}{s.to || ''}
                        </div>
                        {item.role === 'joker' && (
                          <div className="shift-badge-label">{t('shiftJokerLabel')}</div>
                        )}
                        {colleagues.length > 0 && (
                          <div className="shift-employees">
                            {t('shiftAssignedTo')} {colleagues.join(', ')}
                          </div>
                        )}
                        {item.role === 'joker' && jokerUsers.length > 0 && (
                          <div className="shift-joker-label">
                            {t('shiftJokerLabel')} {jokerUsers.map(u => u.fullname).join(', ')}
                          </div>
                        )}
                        {s.notes && (
                          <div className="shift-notes">{s.notes}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const DAY_KEYS = ['shiftSun','shiftMon','shiftTue','shiftWed','shiftThu','shiftFri','shiftSat'];
