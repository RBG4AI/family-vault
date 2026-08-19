export const telHref = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const href = raw.replace(/[^\d+]/g, '');
  const digits = href.replace(/\D/g, '');
  if (digits.length < 6) return '';
  return `tel:${href}`;
};

export const optionLabel = (t, value) => {
  if (!value) return '';
  const translated = t(`option.${value}`);
  return translated.startsWith('option.') ? value : translated;
};

export const ageFromBirthday = (iso) => {
  if (!iso) return null;
  const birth = new Date(iso);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
  if (age < 0 || age > 130) return null;
  return age;
};
