export const vitalNum = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const bpStatus = (systolic, diastolic) => {
  const sys = vitalNum(systolic);
  const dia = vitalNum(diastolic);
  if (sys == null && dia == null) return null;
  if ((sys != null && sys >= 140) || (dia != null && dia >= 90)) return 'high';
  if ((sys != null && sys >= 120) || (dia != null && dia >= 80)) return 'watch';
  return 'ok';
};

export const sugarStatus = (sugar) => {
  const value = vitalNum(sugar);
  if (value == null) return null;
  if (value >= 126) return 'high';
  if (value >= 100) return 'watch';
  return 'ok';
};

export const pulseStatus = (heartRate) => {
  const value = vitalNum(heartRate);
  if (value == null) return null;
  if (value < 50 || value > 100) return 'watch';
  return 'ok';
};

export const formatVitalDate = (iso) => {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatChartDate = (iso) => {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(iso).slice(5);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

export const deltaLabel = (current, previous) => {
  const a = vitalNum(current);
  const b = vitalNum(previous);
  if (a == null || b == null) return null;
  const diff = Math.round((a - b) * 10) / 10;
  if (diff === 0) return { kind: 'same', value: 0 };
  return { kind: diff > 0 ? 'up' : 'down', value: Math.abs(diff) };
};
