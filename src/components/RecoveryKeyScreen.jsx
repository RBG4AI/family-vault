import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, ShieldAlert } from 'lucide-react';
import { copySecret } from '../utils/clipboard';
import { useI18n } from '../context/I18nContext';

const RecoveryKeyScreen = ({ recoveryKey, onConfirm, onBack, title, body }) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = async () => {
    const ok = await copySecret(recoveryKey);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] min-h-screen flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-8 w-full max-w-md space-y-5"
      >
        {onBack && (
          <button type="button" onClick={onBack} className="text-white/45 hover:text-white flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> {t('recovery.back')}
          </button>
        )}
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-amber-400" />
          <h1 className="font-display text-2xl text-white">{title || t('recovery.saveTitle')}</h1>
        </div>
        <p className="text-white/45 text-sm">
          {body || t('recovery.saveBody')}
        </p>
        <div className="bg-black/40 border border-white/20 rounded-xl p-4">
          <p className="text-white font-mono text-sm break-all tracking-wide">{recoveryKey}</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-xl"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? t('recovery.copied') : t('recovery.copy')}
        </button>
        <label className="flex items-start gap-3 text-sm text-white/70">
          <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-1" />
          {t('recovery.stored')}
        </label>
        <button
          type="button"
          disabled={!saved}
          onClick={onConfirm}
          className="w-full btn-primary py-3.5"
        >
          {t('recovery.continue')}
        </button>
      </motion.div>
    </div>
  );
};

export default RecoveryKeyScreen;
