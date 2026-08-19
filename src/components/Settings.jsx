import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, KeyRound, Shield, Trash2, AlertTriangle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import PWAInstaller from './PWAInstaller';
import RecoveryKeyScreen from './RecoveryKeyScreen';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { passwordScore } from '../crypto/vaultCrypto';
import { useVaultContext } from '../context/VaultContext';
import { storage } from '../utils/storage';
import LanguageSwitch from './LanguageSwitch';
import { useI18n } from '../context/I18nContext';
import { vaultErrorText } from '../i18n/vaultErrors';
import SecretInput from './SecretInput';

const Settings = () => {
  const vault = useVaultContext();
  const { t } = useI18n();
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [newRecoveryKey, setNewRecoveryKey] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [confirmName, setConfirmName] = useState('');
  const [destroyError, setDestroyError] = useState('');
  const [autoLockMinutes, setAutoLockMinutes] = useState(() => storage.get('settings')?.autoLockMinutes || 2);
  const [lockSaved, setLockSaved] = useState(false);

  const setAutoLock = (minutes) => {
    const value = Number(minutes);
    setAutoLockMinutes(value);
    storage.set('settings', {
      ...(storage.get('settings') || {}),
      autoLockMinutes: value,
    });
    setLockSaved(true);
    window.setTimeout(() => setLockSaved(false), 2000);
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (nextPassword.length < 10 || passwordScore(nextPassword) < 3) {
      setPasswordMessage(t('settings.weakPassword'));
      return;
    }
    if (nextPassword !== confirmPassword) {
      setPasswordMessage(t('settings.mismatch'));
      return;
    }
    try {
      await vault.updateMasterPassword(currentPassword, nextPassword);
      setCurrentPassword('');
      setNextPassword('');
      setConfirmPassword('');
      setPasswordMessage(t('settings.passwordUpdated'));
    } catch (error) {
      setPasswordMessage(vaultErrorText(error, t));
    }
  };

  const handleRotateRecovery = async (event) => {
    event.preventDefault();
    try {
      const key = await vault.rotateRecoveryKey(recoveryPassword);
      setRecoveryPassword('');
      setRecoveryMessage('');
      setNewRecoveryKey(key);
    } catch (error) {
      setRecoveryMessage(vaultErrorText(error, t));
    }
  };

  const handleExport = async () => {
    const backup = await vault.exportEncryptedBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = String(vault.meta?.name || 'vault')
      .replace(/[^\p{L}\p{N}._-]+/gu, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'vault';
    link.download = `${safeName}-backup.vault.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const meta = await vault.importEncryptedBackup(parsed);
      setImportMessage(t('settings.imported', { name: meta.name }));
    } catch (error) {
      setImportMessage(vaultErrorText({ code: error.code || 'invalid_backup', message: error.message }, t));
    }
  };

  const handleDestroy = async (event) => {
    event.preventDefault();
    try {
      await vault.destroyActiveVault(confirmName);
      await vault.backToList();
    } catch (error) {
      setDestroyError(vaultErrorText(error, t));
    }
  };

  if (newRecoveryKey) {
    return (
      <RecoveryKeyScreen
        recoveryKey={newRecoveryKey}
        title={t('settings.newRecoveryTitle')}
        body={t('settings.newRecoveryBody')}
        onConfirm={() => setNewRecoveryKey('')}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 mt-12 md:mt-0">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase text-cyan-300/70 mb-2">{t('settings.eyebrow')}</p>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">{t('nav.settings')}</h1>
          <p className="text-white/45">{t('settings.intro')}</p>
        </div>

        <section className="glass-panel rounded-3xl p-6 space-y-3">
          <h2 className="text-white font-semibold">{t('settings.language')}</h2>
          <p className="text-white/40 text-sm">{t('settings.languageHint')}</p>
          <LanguageSwitch />
        </section>

        <section className="glass-panel rounded-3xl p-6 space-y-3">
          <h2 className="text-white font-semibold">{t('settings.autoLock')}</h2>
          <p className="text-white/45 text-sm">{t('settings.autoLockHint')}</p>
          <select
            value={autoLockMinutes}
            onChange={(e) => setAutoLock(e.target.value)}
            className="field max-w-xs"
          >
            <option value={1}>{t('settings.minute1')}</option>
            <option value={2}>{t('settings.minute2')}</option>
            <option value={5}>{t('settings.minute5')}</option>
            <option value={10}>{t('settings.minute10')}</option>
          </select>
          {lockSaved && <p className="text-sm text-emerald-300">{t('common.saved')}</p>}
        </section>

        <section className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="text-primary-400" size={18} />
            <h2 className="text-white font-semibold">{t('settings.changePassword')}</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <SecretInput type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={t('settings.currentPassword')} name="fv-current-master" className="field" />
            <SecretInput type="password" value={nextPassword} onChange={(e) => setNextPassword(e.target.value)} placeholder={t('settings.newPassword')} name="fv-new-master" className="field" />
            <PasswordStrengthMeter password={nextPassword} />
            <SecretInput type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('settings.confirmNew')} name="fv-new-confirm" className="field" />
            {passwordMessage && <p className="text-sm text-amber-300">{passwordMessage}</p>}
            <button type="submit" className="btn-primary">{t('settings.updatePassword')}</button>
          </form>
        </section>

        <section className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="text-amber-400" size={18} />
            <h2 className="text-white font-semibold">{t('settings.recovery')}</h2>
          </div>
          <p className="text-white/45 text-sm">{t('settings.recoveryHint')}</p>
          <form onSubmit={handleRotateRecovery} className="space-y-3">
            <SecretInput type="password" value={recoveryPassword} onChange={(e) => setRecoveryPassword(e.target.value)} placeholder={t('create.password')} name="fv-rotate-master" className="field" />
            {recoveryMessage && <p className="text-sm text-red-400">{recoveryMessage}</p>}
            <button type="submit" className="px-4 py-2 bg-white/10 text-white rounded-xl">{t('settings.generateRecovery')}</button>
          </form>
        </section>

        <section className="glass-panel rounded-3xl p-6 space-y-4">
          <h2 className="text-white font-semibold">{t('settings.backup')}</h2>
          <p className="text-white/45 text-sm">{t('settings.backupHint')}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl">
              <Download size={16} /> {t('settings.export')}
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl cursor-pointer">
              <Upload size={16} /> {t('settings.import')}
              <input type="file" accept="application/json,.json" className="sr-only" onChange={handleImport} />
            </label>
          </div>
          {importMessage && <p className="text-sm text-gray-300">{importMessage}</p>}
        </section>

        <PWAInstaller />
        <div className="glass-panel rounded-3xl p-6">
          <ThemeToggle />
        </div>

        <section className="glass-panel rounded-3xl p-6 space-y-4 border border-rose-500/20">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={18} />
            <h2 className="font-semibold">{t('settings.deleteVault')}</h2>
          </div>
          <p className="text-white/45 text-sm">{t('settings.deleteHint', { name: vault.meta?.name })}</p>
          <form onSubmit={handleDestroy} className="space-y-3">
            <input value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder={t('settings.typeToConfirm', { name: vault.meta?.name })} className="field" />
            {destroyError && <p className="text-red-400 text-sm">{destroyError}</p>}
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl">
              <Trash2 size={16} /> {t('settings.deleteAction')}
            </button>
          </form>
        </section>
      </motion.div>
    </div>
  );
};

export default Settings;
