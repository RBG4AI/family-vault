import React, { useEffect, useState } from 'react';
import { useI18n } from '../context/I18nContext';

const pad = (value) => String(value).padStart(2, '0');

const parseIso = (value) => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return { year: '', month: '', day: '' };
  return { year: match[1], month: match[2], day: match[3] };
};

const daysInMonth = (year, month) => {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
};

const DateSelect = ({ value, onChange, required, range = 'any' }) => {
  const { t, lang } = useI18n();
  const parsed = parseIso(value);
  const [year, setYear] = useState(parsed.year);
  const [month, setMonth] = useState(parsed.month);
  const [day, setDay] = useState(parsed.day);

  useEffect(() => {
    if (!value) return;
    const next = parseIso(value);
    setYear(next.year);
    setMonth(next.month);
    setDay(next.day);
  }, [value]);

  const now = new Date();
  const thisYear = now.getFullYear();
  const startYear = range === 'birth' ? thisYear - 120 : thisYear - 40;
  const endYear = range === 'birth' ? thisYear : thisYear + 40;
  const years = [];
  for (let item = endYear; item >= startYear; item -= 1) years.push(item);
  const maxDay = daysInMonth(year, month);
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';

  const emit = (nextYear, nextMonth, nextDay) => {
    setYear(nextYear);
    setMonth(nextMonth);
    setDay(nextDay);
    if (!nextYear && !nextMonth && !nextDay) {
      onChange('');
      return;
    }
    if (!nextYear || !nextMonth || !nextDay) return;
    const last = daysInMonth(nextYear, nextMonth);
    const safeDay = pad(Math.min(Number(nextDay), last));
    setDay(safeDay);
    onChange(`${nextYear}-${nextMonth}-${safeDay}`);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        required={required}
        value={day}
        aria-label={t('date.day')}
        className="field"
        onChange={(event) => emit(year, month, event.target.value)}
      >
        <option value="" className="bg-dark-800">{t('date.day')}</option>
        {Array.from({ length: maxDay }, (_, index) => {
          const item = pad(index + 1);
          return (
            <option key={item} value={item} className="bg-dark-800">
              {index + 1}
            </option>
          );
        })}
      </select>
      <select
        required={required}
        value={month}
        aria-label={t('date.month')}
        className="field"
        onChange={(event) => emit(year, event.target.value, day)}
      >
        <option value="" className="bg-dark-800">{t('date.month')}</option>
        {Array.from({ length: 12 }, (_, index) => {
          const item = pad(index + 1);
          const name = new Date(2000, index, 1).toLocaleString(locale, { month: 'short' });
          return (
            <option key={item} value={item} className="bg-dark-800">
              {name}
            </option>
          );
        })}
      </select>
      <select
        required={required}
        value={year}
        aria-label={t('date.year')}
        className="field"
        onChange={(event) => emit(event.target.value, month, day)}
      >
        <option value="" className="bg-dark-800">{t('date.year')}</option>
        {years.map((item) => (
          <option key={item} value={String(item)} className="bg-dark-800">
            {item}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DateSelect;
