import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { passwordScore } from '../crypto/vaultCrypto';

const CreateVault = ({ onCreate, onBack, busy, error }) => {
  const [name, setName] = useState('');
  const [kind, setKind] = useState('family');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setLocalError('Give this vault a name, for example Family or Ravi.');
      return;
    }
    if (password.length < 10 || passwordScore(password) < 3) {
      setLocalError('Use at least 10 characters with mixed case, a number, and a symbol.');
      return;
    }
    if (password !== confirm) {
      setLocalError('Passwords do not match.');
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
      >
        {onBack && (
          <button type="button" onClick={onBack} className="text-white/45 hover:text-white flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> All vaults
          </button>
        )}
        <div>
          <h1 className="font-display text-3xl text-white mb-1">Create a vault</h1>
          <p className="text-white/45 text-sm">Each vault is encrypted with its own master password. Use a Family vault for shared household data.</p>
        </div>

        <label className="block">
          <span className="text-sm text-white/70">Vault name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 field"
            placeholder="Family"
            autoFocus
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'family', label: 'Family' },
            { id: 'personal', label: 'Personal' },
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
          <span className="text-sm text-white/70">Master password</span>
          <div className="relative mt-2">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field pr-12"
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordStrengthMeter password={password} />
        </label>

        <label className="block">
          <span className="text-sm text-white/70">Confirm password</span>
          <input
            type={show ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-2 field"
            autoComplete="new-password"
          />
        </label>

        {(localError || error) && <p className="text-rose-300 text-sm">{localError || error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full btn-primary py-3.5"
        >
          <Lock size={18} />
          {busy ? 'Encrypting…' : 'Create encrypted vault'}
        </button>
      </motion.form>
    </div>
  );
};

export default CreateVault;
