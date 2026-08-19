import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { storage } from '../utils/storage';

const SecurityScore = () => {
  const calculateSecurityScore = () => {
    const allData = [
      ...(storage.get('credentials') || []),
      ...(storage.get('emails') || []),
      ...(storage.get('banking') || []),
      ...(storage.get('cards') || [])
    ];

    if (allData.length === 0) return { score: 100, issues: [], strengths: [] };

    let totalScore = 0;
    let issues = [];
    let strengths = [];

    allData.forEach(item => {
      if (item.password) {
        const pwd = item.password;
        let pwdScore = 0;
        
        if (pwd.length >= 8) pwdScore += 20;
        if (/[a-z]/.test(pwd)) pwdScore += 20;
        if (/[A-Z]/.test(pwd)) pwdScore += 20;
        if (/[0-9]/.test(pwd)) pwdScore += 20;
        if (/[^A-Za-z0-9]/.test(pwd)) pwdScore += 20;
        
        totalScore += pwdScore;
        
        if (pwdScore < 60) {
          issues.push(`Weak password for ${item.name || item.appName || item.bankName}`);
        } else if (pwdScore === 100) {
          strengths.push(`Strong password for ${item.name || item.appName || item.bankName}`);
        }
      }
    });

    // Check for duplicate passwords
    const passwords = allData.map(item => item.password).filter(Boolean);
    const duplicates = passwords.filter((pwd, index) => passwords.indexOf(pwd) !== index);
    if (duplicates.length > 0) {
      issues.push(`${duplicates.length} duplicate passwords found`);
      totalScore -= duplicates.length * 10;
    }

    // Check for old passwords (mock - would need actual dates)
    const oldPasswords = allData.filter(item => {
      if (item.updatedAt) {
        const daysSinceUpdate = (Date.now() - new Date(item.updatedAt)) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 90;
      }
      return false;
    });
    
    if (oldPasswords.length > 0) {
      issues.push(`${oldPasswords.length} passwords older than 90 days`);
    }

    const finalScore = Math.max(0, Math.min(100, totalScore / allData.length));
    
    return { score: Math.round(finalScore), issues, strengths };
  };

  const { score, issues, strengths } = calculateSecurityScore();
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-primary-400" />
        <h3 className="font-display text-xl text-white">Security Score</h3>
      </div>

      <div className="text-center mb-6">
        <div className={`font-display text-6xl mb-2 ${getScoreColor(score)}`}>
          {score}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(score)}`}
          />
        </div>
        <p className="text-gray-400">
          {score >= 80 ? 'Excellent Security' : score >= 60 ? 'Good Security' : 'Needs Improvement'}
        </p>
      </div>

      {issues.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h4 className="font-medium text-white">Security Issues</h4>
          </div>
          <div className="space-y-2">
            {issues.slice(0, 3).map((issue, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg p-2">
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                {issue}
              </div>
            ))}
          </div>
        </div>
      )}

      {strengths.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h4 className="font-medium text-white">Security Strengths</h4>
          </div>
          <div className="space-y-2">
            {strengths.slice(0, 2).map((strength, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 rounded-lg p-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                {strength}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SecurityScore;