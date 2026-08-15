export function formatDate(date, opts = {}) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    weekday: opts.weekday ?? 'short',
    month: 'short',
    day: 'numeric',
    year: opts.year ? 'numeric' : undefined,
  });
}

export function formatTime(date, timeFormat = '12-hour') {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: timeFormat !== '24-hour',
  });
}

export function formatDateTimeInput(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isSameDay(a, b) {
  const da = typeof a === 'string' ? new Date(a) : a;
  const db = typeof b === 'string' ? new Date(b) : b;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

export function relativeToNow(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = d.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60000);
  const abs = Math.abs(diffMin);
  if (abs < 1) return 'now';
  if (abs < 60) return diffMin > 0 ? `in ${abs} min` : `${abs} min ago`;
  const diffHr = Math.round(diffMin / 60);
  const absHr = Math.abs(diffHr);
  if (absHr < 24) return diffHr > 0 ? `in ${absHr}h` : `${absHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return diffDay > 0 ? `in ${diffDay}d` : `${Math.abs(diffDay)}d ago`;
}
