import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { passwordScore } from '../crypto/vaultCrypto';

const RecoveryUnlock = ({ vault, onReset, onBack, busy, error }) => {
  const [key, setKey] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password.length < 10 || passwordScore(password) < 3) {
      setLocalError('Choose a stronger master password.');
      return;
    }
    if (password !== confirm) {
      setLocalError('Passwords do not match.');
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
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 className="font-display text-3xl text-white">Recover {vault?.name}</h1>
          <p className="text-white/45 text-sm mt-1">Enter the recovery key, then set a new master password.</p>
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
          placeholder="New master password"
          autoComplete="new-password"
          className="field"
        />
        <PasswordStrengthMeter password={password} />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          autoComplete="new-password"
          className="field"
        />
        {(localError || error) && <p className="text-rose-300 text-sm">{localError || error}</p>}
        <button type="submit" disabled={busy} className="w-full btn-primary py-3.5">
          {busy ? 'Recovering…' : 'Set new password and unlock'}
        </button>
      </motion.form>
    </div>
  );
};

export default RecoveryUnlock;
