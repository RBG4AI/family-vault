import React from 'react';
import { motion } from 'framer-motion';

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    const levels = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-green-500' }
    ];
    
    return { score, ...levels[score] };
  };

  const strength = getStrength(password);
  
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <motion.div
            key={level}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: level <= strength.score ? 1 : 0 }}
            className={`h-1 flex-1 rounded-full ${
              level <= strength.score ? strength.color : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400">{strength.label}</p>
    </div>
  );
};

export default PasswordStrengthMeter;