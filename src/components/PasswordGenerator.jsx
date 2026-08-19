import React, { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';

const charset = {
  lower: 'abcdefghijkmnopqrstuvwxyz',
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  numbers: '23456789',
  symbols: '!@#$%^&*()-_=+[]{}',
};

const generate = (length, options) => {
  const pools = Object.entries(options)
    .filter(([, enabled]) => enabled)
    .map(([key]) => charset[key]);
  if (!pools.length) return '';
  const all = pools.join('');
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  const chars = Array.from(bytes, (byte, index) => {
    const pool = pools[index % pools.length];
    return index < pools.length ? pool[byte % pool.length] : all[byte % all.length];
  });
  return chars.join('');
};

const PasswordGenerator = ({ onUse }) => {
  const [length, setLength] = useState(18);
  const [options, setOptions] = useState({ lower: true, upper: true, numbers: true, symbols: true });
  const [value, setValue] = useState(() => generate(18, { lower: true, upper: true, numbers: true, symbols: true }));

  const preview = useMemo(() => value, [value]);

  const refresh = () => setValue(generate(length, options));

  return (
    <div className="rounded-xl border border-white/10 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-300">Password generator</p>
        <button type="button" onClick={refresh} className="text-gray-400 hover:text-white">
          <RefreshCw size={14} />
        </button>
      </div>
      <p className="font-mono text-white text-sm break-all">{preview}</p>
      <input
        type="range"
        min="12"
        max="32"
        value={length}
        onChange={(e) => {
          const next = Number(e.target.value);
          setLength(next);
          setValue(generate(next, options));
        }}
        className="w-full"
      />
      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
        {Object.keys(charset).map((key) => (
          <label key={key} className="flex items-center gap-1 capitalize">
            <input
              type="checkbox"
              checked={options[key]}
              onChange={(e) => {
                const next = { ...options, [key]: e.target.checked };
                setOptions(next);
                setValue(generate(length, next));
              }}
            />
            {key}
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onUse(preview)}
        className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg text-sm"
      >
        Use this password
      </button>
    </div>
  );
};

export default PasswordGenerator;
