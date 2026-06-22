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
