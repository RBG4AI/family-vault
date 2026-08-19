import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Plus, Shield, Users, FileKey } from 'lucide-react';
import LanguageSwitch from './LanguageSwitch';
import { useI18n } from '../context/I18nContext';

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
      setImportError(error.message || t('list.importFailed'));
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

        <div className="space-y-3">
          {vaults.map((vault) => (
            <button
              key={vault.id}
              onClick={() => onSelect(vault.id)}
              className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                {vault.kind === 'family' ? <Users className="w-6 h-6 text-cyan-300" /> : <Shield className="w-6 h-6 text-violet-300" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-medium truncate">{vault.name}</h3>
                <p className="text-white/40 text-sm">
                  {vault.isLegacy ? t('list.legacy') : vault.kind === 'family' ? t('list.familyVault') : t('list.personalVault')}
                </p>
              </div>
            </button>
          ))}

          <button
            onClick={onCreate}
            className="w-full flex items-center gap-4 p-4 border-2 border-dashed border-white/15 rounded-2xl hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-colors"
          >
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white/50" />
            </div>
            <span className="text-white/80 font-medium">{t('list.create')}</span>
          </button>

          <label className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <FileKey className="w-6 h-6 text-white/50" />
            </div>
            <div>
              <span className="text-white/80 font-medium block">{t('list.import')}</span>
              <span className="text-white/35 text-sm">{t('list.importHint')}</span>
            </div>
            <input type="file" accept="application/json,.json" className="hidden" onChange={handleImport} />
          </label>
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
