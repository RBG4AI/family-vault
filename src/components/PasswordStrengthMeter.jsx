import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../context/I18nContext';
import { passwordScore } from '../crypto/vaultCrypto';

const LEVELS = [
  { labelKey: 'strength.veryWeak', color: 'bg-red-500' },
  { labelKey: 'strength.weak', color: 'bg-orange-500' },
  { labelKey: 'strength.fair', color: 'bg-yellow-500' },
  { labelKey: 'strength.good', color: 'bg-blue-500' },
  { labelKey: 'strength.strong', color: 'bg-green-500' },
];

const PasswordStrengthMeter = ({ password }) => {
  const { t } = useI18n();
  if (!password) return null;
  const score = passwordScore(password);
  const level = LEVELS[Math.max(0, Math.min(score, 5) - 1)] || LEVELS[0];
  const filled = Math.max(score, 1);

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((bar) => (
          <motion.div
            key={bar}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: bar <= filled ? 1 : 0 }}
            className={`h-1 flex-1 rounded-full ${bar <= filled ? level.color : 'bg-white/20'}`}
          />
        ))}
      </div>
      <p className="text-xs text-white/55">{t(level.labelKey)}</p>
    </div>
  );
};

export default PasswordStrengthMeter;
