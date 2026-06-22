import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [toast, setToast] = useState({ msg: '', type: '', visible: false });
  const timerRef = useRef(null);

  const showToast = useCallback((msg, type = '') => {
    clearTimeout(timerRef.current);
    setToast({ msg, type, visible: true });
    timerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  return { toast, showToast };
}
