import { useState, useCallback } from 'react';
import { loadEntries, saveEntries, uid, monthKey } from '../utils/storage';

export function useEntries(currentUser) {
  const [entries, setEntries] = useState(() => loadEntries());

  const refreshEntries = useCallback(() => {
    setEntries(loadEntries());
  }, []);

  const getMyEntries = useCallback(() => {
    return entries.filter(e => e.userId === currentUser?.id);
  }, [entries, currentUser]);

  const saveEntry = useCallback((entryData, editingEntry) => {
    const all = loadEntries();
    if (editingEntry) {
      const idx = all.findIndex(e => e.id === editingEntry.id);
      if (idx > -1) {
        all[idx] = { ...all[idx], ...entryData, hours: parseFloat(entryData.hours), monthKey: monthKey(new Date(entryData.date + 'T12:00:00')) };
      }
    } else {
      all.push({
        id: uid(),
        userId: currentUser.id,
        ...entryData,
        hours: parseFloat(entryData.hours),
        monthKey: monthKey(new Date(entryData.date + 'T12:00:00')),
        created: new Date().toISOString()
      });
    }
    saveEntries(all);
    setEntries(all);
  }, [currentUser]);

  const deleteEntry = useCallback((id) => {
    const all = loadEntries().filter(e => e.id !== id);
    saveEntries(all);
    setEntries(all);
  }, []);

  return { entries, setEntries, refreshEntries, getMyEntries, saveEntry, deleteEntry };
}
