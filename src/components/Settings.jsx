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
  const autoLockMinutes = storage.get('settings')?.autoLockMinutes || 2;

  const setAutoLock = (minutes) => {
    storage.set('settings', {
      ...(storage.get('settings') || {}),
      autoLockMinutes: Number(minutes),
    });
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (nextPassword.length < 10 || passwordScore(nextPassword) < 3) {
      setPasswordMessage('New password is too weak.');
      return;
    }
    if (nextPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match.');
      return;
    }
    try {
      await vault.updateMasterPassword(currentPassword, nextPassword);
      setCurrentPassword('');
      setNextPassword('');
      setConfirmPassword('');
      setPasswordMessage('Master password updated.');
    } catch (error) {
      setPasswordMessage(error.message);
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
      setRecoveryMessage(error.message);
    }
  };

  const handleExport = async () => {
    const backup = await vault.exportEncryptedBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${vault.meta?.name || 'vault'}-backup.vault.json`;
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
      setImportMessage(`Imported “${meta.name}”. Unlock it from the vault list after lock.`);
    } catch (error) {
      setImportMessage(error.message);
    }
  };

  const handleDestroy = async (event) => {
    event.preventDefault();
    try {
      await vault.destroyActiveVault(confirmName);
      await vault.backToList();
    } catch (error) {
      setDestroyError(error.message);
    }
  };

  if (newRecoveryKey) {
    return (
      <RecoveryKeyScreen
        recoveryKey={newRecoveryKey}
        title="New recovery key"
        body="The previous recovery key no longer works. Store this one offline."
        onConfirm={() => setNewRecoveryKey('')}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 mt-12 md:mt-0">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase text-cyan-300/70 mb-2">Vault</p>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">Settings</h1>
          <p className="text-white/45">This vault is encrypted on this device with AES-256-GCM. Your master password is never stored.</p>
        </div>

        <section className="glass-panel rounded-3xl p-6 space-y-3">
          <h2 className="text-white font-semibold">{t('settings.language')}</h2>
          <p className="text-white/40 text-sm">{t('settings.languageHint')}</p>
          <LanguageSwitch />
        </section>

        <section className="glass-panel rounded-3xl p-6 space-y-3">
          <h2 className="text-white font-semibold">Auto-lock</h2>
          <p className="text-gray-400 text-sm">Locks the vault and wipes keys from memory after inactivity.</p>
          <select
            value={autoLockMinutes}
            onChange={(e) => setAutoLock(e.target.value)}
            className="field max-w-xs"
          >
            <option value={1}>1 minute</option>
            <option value={2}>2 minutes</option>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
          </select>
        </section>

        <section className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="text-primary-400" size={18} />
            <h2 className="text-white font-semibold">Change master password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" autoComplete="current-password" className="field" />
            <input type="password" value={nextPassword} onChange={(e) => setNextPassword(e.target.value)} placeholder="New password" autoComplete="new-password" className="field" />
            <PasswordStrengthMeter password={nextPassword} />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" className="field" />
            {passwordMessage && <p className="text-sm text-amber-300">{passwordMessage}</p>}
            <button type="submit" className="btn-primary">Update password</button>
          </form>
        </section>

        <section className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="text-amber-400" size={18} />
            <h2 className="text-white font-semibold">Recovery key</h2>
          </div>
          <p className="text-gray-400 text-sm">Regenerating invalidates the previous key. The new key is shown once.</p>
          <form onSubmit={handleRotateRecovery} className="space-y-3">
            <input type="password" value={recoveryPassword} onChange={(e) => setRecoveryPassword(e.target.value)} placeholder="Master password" className="field" />
            {recoveryMessage && <p className="text-sm text-red-400">{recoveryMessage}</p>}
            <button type="submit" className="px-4 py-2 bg-white/10 text-white rounded-xl">Generate new recovery key</button>
          </form>
        </section>

        <section className="glass-panel rounded-3xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Encrypted backup</h2>
          <p className="text-gray-400 text-sm">The file stays encrypted. Copy it by USB, AirDrop, or a trusted drive. Anyone with the file still needs the master password or recovery key.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl">
              <Download size={16} /> Export backup
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl cursor-pointer">
              <Upload size={16} /> Import backup
              <input type="file" accept="application/json,.json" className="hidden" onChange={handleImport} />
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
            <h2 className="font-semibold">Delete this vault</h2>
          </div>
          <p className="text-gray-400 text-sm">Permanently removes encrypted data for “{vault.meta?.name}” from this device.</p>
          <form onSubmit={handleDestroy} className="space-y-3">
            <input value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder={`Type ${vault.meta?.name} to confirm`} className="field" />
            {destroyError && <p className="text-red-400 text-sm">{destroyError}</p>}
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl">
              <Trash2 size={16} /> Delete vault
            </button>
          </form>
        </section>
      </motion.div>
    </div>
  );
};

export default Settings;
