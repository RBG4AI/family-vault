import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { passwordScore } from '../crypto/vaultCrypto';
import { useI18n } from '../context/I18nContext';
import SecretInput from './SecretInput';

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
        autoComplete="off"
      >
        <button type="button" onClick={onBack} className="text-white/45 hover:text-white flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> {t('recovery.back')}
        </button>
        <div>
          <h1 className="font-display text-3xl text-white">{t('recovery.title', { name: vault?.name || t('nav.vault') })}</h1>
          <p className="text-white/45 text-sm mt-1">{t('recovery.body')}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl p-3 bg-gradient-to-br from-amber-400/20 to-orange-500/10">
            <ShieldAlert size={16} className="text-amber-200" />
            <p className="text-[11px] text-amber-100 mt-2 leading-tight">{t('settings.newRecoveryBody')}</p>
          </div>
          <div className="rounded-2xl p-3 bg-gradient-to-br from-emerald-400/20 to-teal-500/10">
            <p className="text-[11px] text-emerald-100 leading-tight">{t('unlock.neverStored')}</p>
          </div>
        </div>
        <textarea
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="XXXX-XXXX-XXXX-..."
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          className="field h-28 font-mono text-sm"
        />
        <SecretInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('recovery.newPassword')}
          name="fv-recovery-master"
          className="field"
        />
        <PasswordStrengthMeter password={password} />
        <SecretInput
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={t('recovery.confirm')}
          name="fv-recovery-confirm"
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
