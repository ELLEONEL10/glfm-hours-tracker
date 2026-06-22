import { useState, useEffect, useCallback } from 'react';
import { onEntriesSnapshot, createEntry, updateEntry, deleteEntryDoc } from '../firebase/db';
import { monthKey } from '../utils/storage';
import { hasConfig } from '../firebase/config';

export function useEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasConfig) {
      setLoading(false);
      return;
    }
    const unsub = onEntriesSnapshot((data) => {
      setEntries(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const saveEntry = useCallback(async (entryData, editingEntry, currentUser) => {
    try {
      const data = {
        date: entryData.date,
        place: entryData.place,
        from: entryData.from || '',
        to: entryData.to || '',
        hours: parseFloat(entryData.hours),
        notes: entryData.notes || '',
        monthKey: monthKey(new Date(entryData.date + 'T12:00:00')),
      };

      if (editingEntry) {
        await updateEntry(editingEntry.id, data);
      } else {
        await createEntry({ ...data, userId: currentUser.uid });
      }
    } catch (err) {
      console.error('Save entry error:', err);
    }
  }, []);

  const deleteEntry = useCallback(async (id) => {
    try {
      await deleteEntryDoc(id);
    } catch (err) {
      console.error('Delete entry error:', err);
    }
  }, []);

  return { entries, loading, saveEntry, deleteEntry };
}
