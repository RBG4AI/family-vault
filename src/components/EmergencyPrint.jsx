import React from 'react';
import { buildEmergencySheet } from '../utils/emergencySheet';
import { useI18n } from '../context/I18nContext';
import { optionLabel } from '../utils/telLink';

const Field = ({ label, value }) => {
  if (!value) return null;
  return (
    <p className="text-sm leading-6">
      <span className="inline-block min-w-[9rem] text-neutral-600">{label}</span>
      {value}
    </p>
  );
};

const Block = ({ title, rows, numberLabel, extraLabel }) => {
  if (!rows.length) return null;
  return (
    <section className="mb-5 break-inside-avoid">
      <h2 className="text-sm font-semibold border-b border-neutral-300 pb-1 mb-2">{title}</h2>
      <ul className="space-y-3">
        {rows.map((row, index) => (
          <li key={`${row.title}-${index}`} className="text-sm leading-6">
            <p className="font-medium">{row.title}{row.holder ? ` · ${row.holder}` : ''}</p>
            {row.number ? <p>{numberLabel} {row.number}</p> : null}
            {row.extra ? <p>{extraLabel ? `${extraLabel} ${row.extra}` : row.extra}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
};

const EmergencyPrint = ({ data }) => {
  const { t } = useI18n();
  const sheet = buildEmergencySheet(data);
  const printed = new Date().toLocaleString();

  return (
    <div id="emergency-print" className="hidden print:block p-8 text-black bg-white">
      <h1 className="text-xl font-semibold mb-1">{t('sheet.title')}</h1>
      <p className="text-sm mb-1">{t('sheet.subtitle')}</p>
      <p className="text-xs text-neutral-600 mb-6">{t('sheet.keptInVault')} · {t('sheet.printed', { date: printed })}</p>

      <section className="mb-5">
        <h2 className="text-sm font-semibold border-b border-neutral-300 pb-1 mb-2">{t('nav.people')}</h2>
        {sheet.people.length === 0 && <p className="text-sm">{t('sheet.empty')}</p>}
        <div className="space-y-4">
          {sheet.people.map((person) => (
            <div key={person.id || person.name} className="break-inside-avoid">
              <p className="font-semibold">
                {person.name}
                {person.relation ? ` · ${optionLabel(t, person.relation)}` : ''}
              </p>
              <Field label={t('field.bloodGroup')} value={person.bloodGroup ? optionLabel(t, person.bloodGroup) : ''} />
              <Field label={t('field.allergies')} value={person.allergies} />
              <Field label={t('field.birthday')} value={person.birthday} />
              <Field label={t('field.emergencyPhone')} value={person.emergencyPhone} />
              <Field label={t('field.phone')} value={person.phone} />
              <Field label={t('field.email')} value={person.email} />
              <Field label={t('field.doctorName')} value={person.doctorName} />
              <Field label={t('field.lockerHint')} value={person.lockerHint} />
            </div>
          ))}
        </div>
      </section>

      <Block title={t('nav.government')} rows={sheet.ids} numberLabel={t('field.documentNumber')} />
      <Block title={t('nav.insurance')} rows={sheet.insurance} numberLabel={t('field.policyNumber')} />
      <Block title={t('nav.banking')} rows={sheet.banking} numberLabel={t('field.accountNumber')} extraLabel={t('field.ifscCode')} />
      <Block title={t('nav.cards')} rows={sheet.cards} numberLabel={t('field.cardNumber')} />
      <Block title={t('nav.vehicles')} rows={sheet.vehicles} numberLabel={t('field.registrationNumber')} />
      <Block title={t('nav.properties')} rows={sheet.properties} numberLabel={t('field.surveyNumber')} />
      <Block title={t('nav.investments')} rows={sheet.investments} numberLabel={t('field.accountNumber')} />
    </div>
  );
};

export default EmergencyPrint;
