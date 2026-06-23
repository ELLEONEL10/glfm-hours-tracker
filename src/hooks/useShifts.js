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
    await createShift(shiftData);
  }, []);

  const editShift = useCallback(async (id, data) => {
    await updateShift(id, data);
  }, []);

  const deleteShift = useCallback(async (id) => {
    await deleteShiftDoc(id);
  }, []);

  return { shifts, loading, saveShift, editShift, deleteShift };
}
