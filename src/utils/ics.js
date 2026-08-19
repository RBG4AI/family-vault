const pad = (value) => String(value).padStart(2, '0');

const toIcsDate = (iso) => {
  const value = String(iso || '');
  const month = value.match(/^(\d{4})-(\d{2})$/);
  if (month) {
    const last = new Date(Number(month[1]), Number(month[2]), 0).getDate();
    return `${month[1]}${month[2]}${pad(last)}`;
  }
  const day = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (day) return `${day[1]}${day[2]}${day[3]}`;
  return null;
};

const escapeText = (text) =>
  String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

export const downloadRenewalsIcs = (renewals) => {
  const events = (renewals || [])
    .map((item) => {
      const start = toIcsDate(item.date);
      if (!start) return null;
      const summary = item.subtitle ? `${item.title} — ${item.subtitle}` : item.title;
      return [
        'BEGIN:VEVENT',
        `UID:${escapeText(item.id)}@family-vault`,
        `DTSTART;VALUE=DATE:${start}`,
        `SUMMARY:${escapeText(summary)}`,
        'END:VEVENT',
      ].join('\r\n');
    })
    .filter(Boolean);

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Family Vault//EN',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'family-vault-renewals.ics';
  link.click();
  URL.revokeObjectURL(url);
};
