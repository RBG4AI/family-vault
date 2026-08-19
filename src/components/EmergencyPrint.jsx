import React from 'react';
import { buildEmergencySheet } from '../utils/emergencySheet';
import { useI18n } from '../context/I18nContext';

const Block = ({ title, rows }) => {
  if (!rows.length) return null;
  return (
    <section className="mb-4">
      <h2 className="text-sm font-semibold mb-2">{title}</h2>
      <ul className="text-sm space-y-1">
        {rows.map((row, index) => (
          <li key={`${row.label}-${index}`}>
            {row.label}
            {row.value ? ` · ${row.value}` : ''}
            {row.extra ? ` · ${row.extra}` : ''}
          </li>
        ))}
      </ul>
    </section>
  );
};

const EmergencyPrint = ({ data }) => {
  const { t } = useI18n();
  const sheet = buildEmergencySheet(data);

  return (
    <div id="emergency-print" className="hidden print:block p-8 text-black bg-white">
      <h1 className="text-xl font-semibold mb-1">{t('sheet.title')}</h1>
      <p className="text-sm mb-6">{t('sheet.subtitle')}</p>
      <section className="mb-4">
        <h2 className="text-sm font-semibold mb-2">{t('nav.people')}</h2>
        {sheet.people.length === 0 && <p className="text-sm">{t('sheet.empty')}</p>}
        <ul className="text-sm space-y-2">
          {sheet.people.map((person) => (
            <li key={person.name}>
              <strong>{person.name}</strong>
              {person.relation ? ` · ${person.relation}` : ''}
              {person.bloodGroup ? ` · ${t('field.bloodGroup')} ${person.bloodGroup}` : ''}
              {person.emergencyPhone ? ` · ${t('field.emergencyPhone')} ${person.emergencyPhone}` : ''}
              {person.phone ? ` · ${t('field.phone')} ${person.phone}` : ''}
              {person.doctorName ? ` · ${t('field.doctorName')} ${person.doctorName}` : ''}
              {person.lockerHint ? ` · ${t('field.lockerHint')} ${person.lockerHint}` : ''}
            </li>
          ))}
        </ul>
      </section>
      <Block title={t('nav.government')} rows={sheet.ids} />
      <Block title={t('nav.insurance')} rows={sheet.insurance} />
      <Block title={t('nav.banking')} rows={sheet.banking} />
      <Block title={t('nav.vehicles')} rows={sheet.vehicles} />
    </div>
  );
};

export default EmergencyPrint;
