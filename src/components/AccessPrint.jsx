import React from 'react';
import { useI18n } from '../context/I18nContext';
import { useVaultContext } from '../context/VaultContext';
import { getLastBackupAt } from '../utils/devicePrefs';
import { appUrl } from '../utils/printSection';

const Blank = ({ label }) => (
  <p className="text-sm leading-7">
    {label}{' '}
    <span className="inline-block min-w-[14rem] border-b border-neutral-500 align-baseline">&nbsp;</span>
  </p>
);

const AccessPrint = () => {
  const { t } = useI18n();
  const vault = useVaultContext();
  const lastBackup = getLastBackupAt(vault.meta?.id);
  const printed = new Date().toLocaleString();

  return (
    <div id="access-print" className="hidden print:block p-8 text-black bg-white">
      <h1 className="text-xl font-semibold mb-1">{t('access.title')}</h1>
      <p className="text-sm mb-4">{t('access.subtitle')}</p>
      <p className="text-xs text-neutral-600 mb-6">{t('access.printed', { date: printed })}</p>

      <section className="mb-5">
        <h2 className="text-sm font-semibold border-b border-neutral-300 pb-1 mb-2">{t('access.thisVault')}</h2>
        <p className="text-sm leading-6">{t('access.vaultName')} {vault.meta?.name || '—'}</p>
        <p className="text-sm leading-6 break-all">{t('access.openAt')} {appUrl()}</p>
        <p className="text-sm leading-6 mt-2">{t('access.localOnly')}</p>
        <p className="text-sm leading-6">
          {lastBackup ? t('access.lastBackup', { date: new Date(lastBackup).toLocaleString() }) : t('access.noBackup')}
        </p>
      </section>

      <section className="mb-5">
        <h2 className="text-sm font-semibold border-b border-neutral-300 pb-1 mb-2">{t('access.restoreTitle')}</h2>
        <ol className="list-decimal pl-5 text-sm space-y-1 leading-6">
          <li>{t('access.step1')}</li>
          <li>{t('access.step2')}</li>
          <li>{t('access.step3')}</li>
          <li>{t('access.step4')}</li>
        </ol>
      </section>

      <section className="mb-5">
        <h2 className="text-sm font-semibold border-b border-neutral-300 pb-1 mb-2">{t('access.fillTitle')}</h2>
        <p className="text-sm mb-2">{t('access.fillHint')}</p>
        <Blank label={t('access.backupKept')} />
        <Blank label={t('access.keyKept')} />
        <Blank label={t('access.adult')} />
      </section>

      <section>
        <h2 className="text-sm font-semibold border-b border-neutral-300 pb-1 mb-2">{t('access.neverTitle')}</h2>
        <ul className="list-disc pl-5 text-sm space-y-1 leading-6">
          <li>{t('access.never1')}</li>
          <li>{t('access.never2')}</li>
          <li>{t('access.never3')}</li>
        </ul>
      </section>
    </div>
  );
};

export default AccessPrint;
