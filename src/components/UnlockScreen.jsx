import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import LanguageSwitch from './LanguageSwitch';

const UnlockScreen = ({ vault, onUnlock, onBack, onRecovery, busy, error }) => {
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.form
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={(event) => {
          event.preventDefault();
          onUnlock(password);
        }}
        className="glass-panel rounded-3xl p-8 w-full max-w-md space-y-6"
      >
        <button type="button" onClick={onBack} className="text-white/45 hover:text-white flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> {t('unlock.back')}
        </button>
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 glow-primary">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl text-white">{vault?.name || t('nav.vault')}</h1>
          <p className="text-white/45 mt-2">
            {vault?.isLegacy ? t('unlock.legacy') : t('unlock.body')}
          </p>
        </div>

        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('unlock.password')}
            autoComplete="current-password"
            autoFocus
            className="field pr-12"
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && <p className="text-rose-300 text-sm">{error}</p>}

        <button type="submit" disabled={busy || !password} className="w-full btn-primary py-3.5">
          {busy ? t('unlock.busy') : t('unlock.submit')}
        </button>

        {!vault?.isLegacy && (
          <button type="button" onClick={onRecovery} className="w-full text-sm text-white/40 hover:text-white">
            {t('unlock.recovery')}
          </button>
        )}
        <LanguageSwitch />
      </motion.form>
    </div>
  );
};

export default UnlockScreen;
