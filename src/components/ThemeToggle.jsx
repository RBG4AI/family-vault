import React, { useEffect, useState } from 'react';
import { Moon, Palette, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '../context/I18nContext';

const ACCENTS = {
  blue: '#22d3ee',
  purple: '#a855f7',
  green: '#34d399',
  orange: '#fb923c',
};

const applyTheme = (theme, accent) => {
  const root = document.documentElement;
  root.classList.toggle('light', theme === 'light');
  root.classList.toggle('dark', theme !== 'light');
  root.style.setProperty('--accent-color', ACCENTS[accent] || ACCENTS.blue);
  root.style.colorScheme = theme === 'light' ? 'light' : 'dark';
};

export const applyStoredTheme = () => {
  try {
    applyTheme(localStorage.getItem('vault_theme') || 'dark', localStorage.getItem('vault_accent') || 'blue');
  } catch {
    applyTheme('dark', 'blue');
  }
};

const ThemeToggle = () => {
  const { t } = useI18n();
  const [theme, setTheme] = useState(() => localStorage.getItem('vault_theme') || 'dark');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('vault_accent') || 'blue');

  useEffect(() => {
    applyTheme(theme, accentColor);
  }, [theme, accentColor]);

  const changeTheme = (next) => {
    setTheme(next);
    localStorage.setItem('vault_theme', next);
  };

  const changeAccent = (next) => {
    setAccentColor(next);
    localStorage.setItem('vault_accent', next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          {t('settings.theme')}
        </h4>
        <div className="flex gap-2">
          {[
            { id: 'dark', name: t('settings.dark'), icon: Moon },
            { id: 'light', name: t('settings.light'), icon: Sun },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => changeTheme(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                  theme === item.id ? 'bg-white/15 text-white' : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {item.name}
              </motion.button>
            );
          })}
        </div>
      </div>
      <div>
        <h4 className="text-white font-medium mb-3">{t('settings.accent')}</h4>
        <div className="flex gap-2">
          {Object.entries(ACCENTS).map(([id, color]) => (
            <motion.button
              key={id}
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => changeAccent(id)}
              aria-label={id}
              style={{ backgroundColor: color }}
              className={`w-8 h-8 rounded-full ${accentColor === id ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-800' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
