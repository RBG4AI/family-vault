import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { passwordScore } from '../crypto/vaultCrypto';
import { useI18n } from '../context/I18nContext';

const RecoveryUnlock = ({ vault, onReset, onBack, busy, error }) => {
  const { t } = useI18n();
  const [key, setKey] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password.length < 10 || passwordScore(password) < 3) {
      setLocalError(t('recovery.weak'));
      return;
    }
    if (password !== confirm) {
      setLocalError(t('recovery.mismatch'));
      return;
    }
    setLocalError('');
    onReset(key, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-panel rounded-3xl p-8 w-full max-w-md space-y-5"
      >
        <button type="button" onClick={onBack} className="text-white/45 hover:text-white flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> {t('recovery.back')}
        </button>
        <div>
          <h1 className="font-display text-3xl text-white">{t('recovery.title', { name: vault?.name || t('nav.vault') })}</h1>
          <p className="text-white/45 text-sm mt-1">{t('recovery.body')}</p>
        </div>
        <textarea
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="XXXX-XXXX-XXXX-..."
          className="field h-28 font-mono text-sm"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('recovery.newPassword')}
          autoComplete="new-password"
          className="field"
        />
        <PasswordStrengthMeter password={password} />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={t('recovery.confirm')}
          autoComplete="new-password"
          className="field"
        />
        {(localError || error) && <p className="text-rose-300 text-sm">{localError || error}</p>}
        <button type="submit" disabled={busy} className="w-full btn-primary py-3.5">
          {busy ? t('recovery.busy') : t('recovery.submit')}
        </button>
      </motion.form>
    </div>
  );
};

export default RecoveryUnlock;
