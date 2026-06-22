import { useState, useCallback } from 'react';
import { loadUsers, saveUsers, hashPwd, uid } from '../utils/storage';

export function useUsers() {
  const [users, setUsers] = useState(() => loadUsers());

  const refreshUsers = useCallback(() => {
    setUsers(loadUsers());
  }, []);

  const createUser = useCallback(({ fullname, username, password, role }) => {
    const all = loadUsers();
    if (all.find(u => u.username === username)) {
      return { error: 'errUsernameExists' };
    }
    if (password.length < 6) {
      return { error: 'errPwdLength' };
    }
    const newUser = {
      id: 'u_' + Date.now().toString(36),
      username,
      password: hashPwd(password),
      fullname,
      role,
      created: new Date().toISOString()
    };
    all.push(newUser);
    saveUsers(all);
    setUsers(all);
    return { user: newUser };
  }, []);

  const deleteUser = useCallback((id) => {
    const all = loadUsers().filter(u => u.id !== id);
    saveUsers(all);
    setUsers(all);
  }, []);

  return { users, setUsers, refreshUsers, createUser, deleteUser };
}
