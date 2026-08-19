const parseLocalDate = (iso) => {
  if (!iso) return null;
  const value = String(iso);
  const monthOnly = /^(\d{4})-(\d{2})$/.exec(value);
  if (monthOnly) {
    return new Date(Number(monthOnly[1]), Number(monthOnly[2]), 0);
  }
  const day = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (day) {
    return new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]));
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const daysFrom = (iso) => {
  const date = parseLocalDate(iso);
  if (!date) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.round((date - start) / 86400000);
};

const nextBirthday = (iso) => {
  const birth = parseLocalDate(iso);
  if (!birth) return null;
  const now = new Date();
  const next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < now) next.setFullYear(now.getFullYear() + 1);
  const year = next.getFullYear();
  const month = String(next.getMonth() + 1).padStart(2, '0');
  const day = String(next.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const push = (list, item, field, label, category, section) => {
  const days = daysFrom(item[field]);
  if (days === null) return;
  list.push({
    id: `${item.id}-${field}`,
    itemId: item.id,
    section,
    title: label,
    subtitle: item.name || item.appName || item.documentType || item.insuranceType || item.registrationNumber || item.title,
    date: item[field],
    days,
    category,
  });
};

export const collectRenewals = (data, people = []) => {
  const list = [];
  (data.government || []).forEach((item) => push(list, item, 'expiryDate', item.documentType || 'ID', 'IDs', 'government'));
  (data.insurance || []).forEach((item) => push(list, item, 'policyEndDate', item.insuranceType || 'Insurance', 'Insurance', 'insurance'));
  (data.investments || []).forEach((item) => push(list, item, 'maturityDate', item.name || 'Investment', 'Investments', 'investments'));
  (data.cards || []).forEach((item) => push(list, item, 'expiryDate', item.cardType || 'Card', 'Cards', 'cards'));
  (data.vehicles || []).forEach((item) => {
    push(list, item, 'insuranceExpiry', `${item.name || 'Vehicle'} insurance`, 'Vehicles', 'vehicles');
    push(list, item, 'pucExpiry', `${item.name || 'Vehicle'} PUC`, 'Vehicles', 'vehicles');
    push(list, item, 'rcExpiry', `${item.name || 'Vehicle'} RC`, 'Vehicles', 'vehicles');
  });
  (data.properties || []).forEach((item) => push(list, item, 'taxDueDate', `${item.name || 'Property'} tax`, 'Properties', 'properties'));
  (people || data.people || []).forEach((person) => {
    const date = nextBirthday(person.birthday);
    if (!date) return;
    push(list, { ...person, birthdayNext: date }, 'birthdayNext', `${person.name}'s birthday`, 'Family', 'people');
  });

  return list.sort((a, b) => a.days - b.days);
};
