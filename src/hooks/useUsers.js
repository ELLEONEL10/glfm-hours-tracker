import { useState, useEffect, useCallback } from 'react';
import { onUsersSnapshot, deleteUserDoc } from '../firebase/db';
import { hasConfig } from '../firebase/config';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasConfig) {
      setLoading(false);
      return;
    }
    const unsub = onUsersSnapshot((data) => {
      setUsers(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const deleteUser = useCallback(async (id) => {
    try {
      await deleteUserDoc(id);
    } catch (err) {
      console.error('Delete user error:', err);
      throw err;
    }
  }, []);

  return { users, loading, deleteUser };
}
