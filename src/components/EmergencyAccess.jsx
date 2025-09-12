import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, AlertTriangle, Key } from 'lucide-react';

const EmergencyAccess = () => {
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyDelay, setEmergencyDelay] = useState(72);
  const [emergencyCode, setEmergencyCode] = useState('');

  const generateEmergencyCode = () => {
    const code = Math.random().toString(36).substring(2, 15);
    setEmergencyCode(code);
    localStorage.setItem('emergency_code', code);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-6 h-6 text-red-400" />
        <h3 className="text-xl font-semibold text-white">Emergency Access</h3>
      </div>

      <div className="glass-dark rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Emergency Contact Email
          </label>
          <input
            type="email"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            placeholder="spouse@email.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Emergency Access Delay (hours)
          </label>
          <select
            value={emergencyDelay}
            onChange={(e) => setEmergencyDelay(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
          >
            <option value={24}>24 hours</option>
            <option value={48}>48 hours</option>
            <option value={72}>72 hours</option>
            <option value={168}>1 week</option>
          </select>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h4 className="font-medium text-red-400">Emergency Code</h4>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            Share this code with your spouse. They can use it to access your vault after the delay period.
          </p>
          <div className="flex gap-3">
            <div className="flex-1 bg-black/20 rounded-lg px-3 py-2">
              <span className="text-white font-mono">{emergencyCode || 'Not generated'}</span>
            </div>
            <button
              onClick={generateEmergencyCode}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAccess;