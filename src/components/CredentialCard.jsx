import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Copy, Edit, Trash2, Check } from 'lucide-react';
import { copyToClipboard } from '../utils/storage';

const CredentialCard = ({ credential, onEdit, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState('');

  const handleCopy = async (text, field) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(field);
      setTimeout(() => setCopied(''), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="glass-dark rounded-xl md:rounded-2xl p-4 md:p-6 hover:bg-white/5 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-white mb-1">
            {credential.bankName || credential.emailAddress || credential.name || credential.appName || credential.documentType || credential.insuranceType || credential.cardType || credential.provider}
          </h3>
          <p className="text-gray-400 text-xs md:text-sm">
            {credential.accountNumber ? `****${credential.accountNumber.slice(-4)}` :
             credential.cardNumber ? `****-****-****-${credential.cardNumber.slice(-4)}` :
             credential.documentNumber ? `****${credential.documentNumber.slice(-4)}` :
             credential.policyNumber ? `****${credential.policyNumber.slice(-4)}` :
             credential.emailAddress ? `****${credential.emailAddress.split('@')[0].slice(-2)}@${credential.emailAddress.split('@')[1]}` :
             credential.username || credential.customerId || 'No details'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(credential)}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(credential.id)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Password field - always show if exists */}
        {credential.password && (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-white font-mono text-sm">
                {showPassword ? credential.password : '••••••••'}
              </span>
              <div className="flex gap-1">
                <button onClick={() => setShowPassword(!showPassword)} className="p-1 text-gray-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => handleCopy(credential.password, 'password')} className="p-1 text-gray-400 hover:text-white transition-colors">
                  {copied === 'password' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {credential.tags && credential.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {credential.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-primary-600/20 text-primary-400 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CredentialCard;