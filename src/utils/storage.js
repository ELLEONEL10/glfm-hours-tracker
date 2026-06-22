const DB_USERS   = 'glfm_users';
const DB_ENTRIES = 'glfm_entries';
const DB_SESSION = 'glfm_session';

export function loadUsers() {
  try { return JSON.parse(localStorage.getItem(DB_USERS)) || []; } catch { return []; }
}
export function saveUsers(u) {
  localStorage.setItem(DB_USERS, JSON.stringify(u));
}
export function loadEntries() {
  try { return JSON.parse(localStorage.getItem(DB_ENTRIES)) || []; } catch { return []; }
}
export function saveEntries(e) {
  localStorage.setItem(DB_ENTRIES, JSON.stringify(e));
}
export function loadSession() {
  try { return JSON.parse(sessionStorage.getItem(DB_SESSION)) || null; } catch { return null; }
}
export function saveSession(s) {
  sessionStorage.setItem(DB_SESSION, JSON.stringify(s));
}
export function clearSession() {
  sessionStorage.removeItem(DB_SESSION);
}

export function hashPwd(p) {
  return btoa(unescape(encodeURIComponent(p)));
}

export function uid() {
  return 'e_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function initials(n) {
  return n.trim().split(' ').map(w => w[0]?.toUpperCase() || '').slice(0, 2).join('');
}

export function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function fmtHrs(h) {
  const n = parseFloat(h) || 0;
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}
