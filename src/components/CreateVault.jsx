import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { passwordScore } from '../crypto/vaultCrypto';
import { useI18n } from '../context/I18nContext';
import LanguageSwitch from './LanguageSwitch';
import SecretInput from './SecretInput';

const CreateVault = ({ onCreate, onBack, busy, error }) => {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [kind, setKind] = useState('family');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setLocalError(t('create.needName'));
      return;
    }
    if (password.length < 10 || passwordScore(password) < 3) {
      setLocalError(t('create.weak'));
      return;
    }
    if (password !== confirm) {
      setLocalError(t('create.mismatch'));
      return;
    }
    setLocalError('');
    onCreate({ name, kind, password });
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
        {onBack && (
          <button type="button" onClick={onBack} className="text-white/45 hover:text-white flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> {t('create.back')}
          </button>
        )}
        <div>
          <h1 className="font-display text-3xl text-white mb-1">{t('create.title')}</h1>
          <p className="text-white/45 text-sm">{t('create.body')}</p>
        </div>

        <label className="block">
          <span className="text-sm text-white/70">{t('create.name')}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 field"
            placeholder={t('create.family')}
            autoFocus
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'family', label: t('create.family') },
            { id: 'personal', label: t('create.personal') },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setKind(option.id)}
              className={`px-4 py-3 rounded-xl border ${
                kind === option.id ? 'border-cyan-400/50 bg-cyan-400/10 text-white' : 'border-white/10 text-white/45'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="text-sm text-white/70">{t('create.password')}</span>
          <div className="relative mt-2">
            <SecretInput
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field pr-12"
              name="fv-create-master"
            />
            <button
              type="button"
              aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordStrengthMeter password={password} />
        </label>

        <label className="block">
          <span className="text-sm text-white/70">{t('create.confirm')}</span>
          <div className="relative mt-2">
            <SecretInput
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="field pr-12"
              name="fv-create-confirm"
            />
            <button
              type="button"
              aria-label={showConfirm ? t('common.hideConfirm') : t('common.showConfirm')}
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        {(localError || error) && <p className="text-rose-300 text-sm">{localError || error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full btn-primary py-3.5"
        >
          <Lock size={18} />
          {busy ? t('create.busy') : t('create.submit')}
        </button>
        <LanguageSwitch />
      </motion.form>
    </div>
  );
};

export default CreateVault;
