export const daysUntil = (iso) => {
  if (!iso) return null;
  const value = String(iso);
  const monthOnly = value.match(/^(\d{4})-(\d{2})$/);
  let date = null;
  if (monthOnly) {
    date = new Date(Number(monthOnly[1]), Number(monthOnly[2]), 0);
  } else {
    const day = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (day) date = new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]));
    else {
      const parsed = new Date(value);
      date = Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }
  if (!date || Number.isNaN(date.getTime())) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.round((date - start) / 86400000);
};

export const formatDisplayDate = (iso) => {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export const dueTone = (days) => {
  if (days == null) return 'muted';
  if (days < 0) return 'overdue';
  if (days <= 14) return 'soon';
  if (days <= 60) return 'watch';
  return 'ok';
};
