import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, Upload, Key } from 'lucide-react';

const SharedProfile = () => {
  const [shareCode, setShareCode] = useState('');
  const [importCode, setImportCode] = useState('');

  const generateShareCode = () => {
    // Get all data from current profile
    const allData = {
      credentials: JSON.parse(localStorage.getItem('credentials') || '[]'),
      emails: JSON.parse(localStorage.getItem('emails') || '[]'),
      banking: JSON.parse(localStorage.getItem('banking') || '[]'),
      cards: JSON.parse(localStorage.getItem('cards') || '[]'),
      government: JSON.parse(localStorage.getItem('government') || '[]'),
      insurance: JSON.parse(localStorage.getItem('insurance') || '[]'),
      investments: JSON.parse(localStorage.getItem('investments') || '[]'),
      profile: JSON.parse(sessionStorage.getItem('vault_profile') || '{}')
    };

    // Create shareable code
    const code = btoa(JSON.stringify(allData));
    setShareCode(code);
  };

  const importFromCode = () => {
    try {
      const data = JSON.parse(atob(importCode));
      
      // Import all data
      Object.keys(data).forEach(key => {
        if (key !== 'profile' && Array.isArray(data[key])) {
          localStorage.setItem(key, JSON.stringify(data[key]));
        }
      });

      alert('Data imported successfully! Refresh the page to see changes.');
      setImportCode('');
    } catch (error) {
      alert('Invalid import code');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Share2 className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Share Profile</h3>
      </div>

      {/* Generate Share Code */}
      <div className="glass-dark rounded-xl p-6">
        <h4 className="font-medium text-white mb-3">Share Your Data</h4>
        <p className="text-gray-400 text-sm mb-4">
          Generate a code to share your vault data with your spouse
        </p>
        <button
          onClick={generateShareCode}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors mb-4"
        >
          Generate Share Code
        </button>
        {shareCode && (
          <div className="bg-black/20 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-2">Share this code with your spouse:</p>
            <div className="bg-white/5 rounded p-2 break-all text-white text-sm font-mono">
              {shareCode}
            </div>
          </div>
        )}
      </div>

      {/* Import Code */}
      <div className="glass-dark rounded-xl p-6">
        <h4 className="font-medium text-white mb-3">Import Shared Data</h4>
        <p className="text-gray-400 text-sm mb-4">
          Enter the code shared by your spouse
        </p>
        <textarea
          value={importCode}
          onChange={(e) => setImportCode(e.target.value)}
          placeholder="Paste the share code here..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors mb-4 h-32 resize-none"
        />
        <button
          onClick={importFromCode}
          disabled={!importCode.trim()}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Import Data
        </button>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <h4 className="font-medium text-yellow-400 mb-2">How to Share</h4>
        <ol className="text-gray-400 text-sm space-y-1 list-decimal list-inside">
          <li>Generate share code on your phone</li>
          <li>Send code to spouse via WhatsApp/SMS</li>
          <li>Spouse pastes code and imports data</li>
          <li>Both phones now have same data</li>
        </ol>
      </div>
    </div>
  );
};

export default SharedProfile;