import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Palette } from 'lucide-react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('blue');

  const themes = [
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'light', name: 'Light', icon: Sun }
  ];

  const accents = [
    { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
    { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
    { id: 'green', name: 'Green', color: 'bg-green-500' },
    { id: 'orange', name: 'Orange', color: 'bg-orange-500' }
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('vault_theme') || 'dark';
    const savedAccent = localStorage.getItem('vault_accent') || 'blue';
    setTheme(savedTheme);
    setAccentColor(savedAccent);
    
    document.documentElement.className = savedTheme;
    document.documentElement.style.setProperty('--accent-color', getAccentValue(savedAccent));
  }, []);

  const getAccentValue = (accent) => {
    const colors = {
      blue: '#3b82f6',
      purple: '#8b5cf6',
      green: '#10b981',
      orange: '#f59e0b'
    };
    return colors[accent];
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('vault_theme', newTheme);
    document.documentElement.className = newTheme;
  };

  const changeAccent = (newAccent) => {
    setAccentColor(newAccent);
    localStorage.setItem('vault_accent', newAccent);
    document.documentElement.style.setProperty('--accent-color', getAccentValue(newAccent));
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Theme
        </h4>
        <div className="flex gap-2">
          {themes.map((t) => {
            const Icon = t.icon;
            return (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => changeTheme(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  theme === t.id 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                {t.name}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-white font-medium mb-3">Accent Color</h4>
        <div className="flex gap-2">
          {accents.map((accent) => (
            <motion.button
              key={accent.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => changeAccent(accent.id)}
              className={`w-8 h-8 rounded-full ${accent.color} ${
                accentColor === accent.id ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-800' : ''
              }`}
              title={accent.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;