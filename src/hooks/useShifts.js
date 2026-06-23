import { useState, useEffect, useCallback } from 'react';
import { onShiftsSnapshot, createShift, updateShift, deleteShiftDoc } from '../firebase/db';
import { hasConfig } from '../firebase/config';

export function useShifts() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasConfig) {
      setLoading(false);
      return;
    }
    const unsub = onShiftsSnapshot((data) => {
      setShifts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const saveShift = useCallback(async (shiftData) => {
    try {
      await createShift(shiftData);
    } catch (err) {
      console.error('Save shift error:', err);
    }
  }, []);

  const editShift = useCallback(async (id, data) => {
    try {
      await updateShift(id, data);
    } catch (err) {
      console.error('Edit shift error:', err);
    }
  }, []);

  const deleteShift = useCallback(async (id) => {
    try {
      await deleteShiftDoc(id);
    } catch (err) {
      console.error('Delete shift error:', err);
    }
  }, []);

  return { shifts, loading, saveShift, editShift, deleteShift };
}
