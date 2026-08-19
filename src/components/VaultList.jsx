import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Plus, Shield, Users, FileKey } from 'lucide-react';
import LanguageSwitch from './LanguageSwitch';
import { useI18n } from '../context/I18nContext';
import { vaultErrorText } from '../i18n/vaultErrors';
import StorageDisclaimer from './StorageDisclaimer';

const VaultList = ({ vaults, onSelect, onCreate, onImport }) => {
  const { t } = useI18n();
  const [importError, setImportError] = useState('');

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      await onImport(parsed);
      setImportError('');
    } catch (error) {
      setImportError(vaultErrorText({ code: error.code || 'invalid_backup', message: error.message }, t));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 glow-primary">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <p className="text-xs tracking-[0.22em] uppercase text-cyan-300/70 mb-2">{t('app.onDevice')}</p>
          <h1 className="font-display text-4xl text-white mb-2">{t('app.title')}</h1>
        <p className="text-white/45">{t('app.tagline')}</p>
        </div>

        {vaults.length > 0 && (
          <div className="rounded-3xl p-4 mb-6 bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
            <p className="font-display text-2xl">{vaults.length}</p>
            <p className="text-xs opacity-90 mt-1">{t('list.vaultCount', { count: vaults.length })}</p>
          </div>
        )}

        <StorageDisclaimer className="mb-6" />

        <div className="space-y-3">
          {vaults.map((vault) => (
            <button
              key={vault.id}
              onClick={() => onSelect(vault.id)}
              className="w-full overflow-hidden rounded-2xl text-left border border-white/10 hover:border-white/25"
            >
              <div className={`h-1.5 bg-gradient-to-r ${vault.kind === 'family' ? 'from-cyan-400 to-blue-500' : 'from-violet-400 to-fuchsia-500'}`} />
              <div className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${vault.kind === 'family' ? 'from-cyan-400 to-blue-500' : 'from-violet-400 to-fuchsia-500'} flex items-center justify-center`}>
                  {vault.kind === 'family' ? <Users className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-medium truncate">{vault.name}</h3>
                  <p className="text-white/40 text-sm">
                    {vault.isLegacy ? t('list.legacy') : vault.kind === 'family' ? t('list.familyVault') : t('list.personalVault')}
                  </p>
                </div>
              </div>
            </button>
          ))}

          <button
            onClick={onCreate}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/20 hover:border-emerald-300/40"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-medium">{t('list.create')}</span>
          </button>

          <div className="w-full p-4 rounded-2xl bg-gradient-to-br from-amber-400/15 to-orange-500/10 border border-amber-400/20 space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <FileKey className="w-6 h-6 text-white" />
              </div>
              <div>
                <label htmlFor="vault-backup-import" className="text-white font-medium block">{t('list.import')}</label>
                <p className="text-white/50 text-sm">{t('list.importHint')}</p>
              </div>
            </div>
            <input
              id="vault-backup-import"
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              className="block w-full text-sm text-white/70 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-400/20 file:text-cyan-100"
            />
          </div>
          {importError && <p className="text-rose-300 text-sm">{importError}</p>}
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <LanguageSwitch />
        </div>
      </motion.div>
    </div>
  );
};

export default VaultList;
