import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';

const AddCredentialModal = ({ isOpen, onClose, onSave, editData, type }) => {
  const [formData, setFormData] = useState({});
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (editData) {
      setFormData(editData);
      setTags(editData.tags || []);
    } else {
      setFormData({});
      setTags([]);
    }
  }, [editData, isOpen]);

  const getFormFields = () => {
    switch (type) {
      case 'email':
        return [
          { key: 'emailAddress', label: 'Email Address', type: 'email', required: true },
          { key: 'password', label: 'Password', type: 'password', required: true },
          { key: 'recoveryEmail', label: 'Recovery Email', type: 'email' },
          { key: 'recoveryPhone', label: 'Recovery Phone', type: 'tel' },
          { key: 'twoFactorEnabled', label: '2FA Enabled', type: 'checkbox' },
        ];
      case 'app':
        return [
          { key: 'appName', label: 'App/Website Name', type: 'text', required: true },
          { key: 'username', label: 'Username', type: 'text', required: true },
          { key: 'password', label: 'Password', type: 'password', required: true },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ];
      case 'banking':
        return [
          { key: 'bankName', label: 'Bank Name', type: 'text', required: true },
          { key: 'accountNumber', label: 'Account Number', type: 'text', required: true },
          { key: 'ifscCode', label: 'IFSC Code', type: 'text', required: true },
          { key: 'customerId', label: 'Customer ID', type: 'text', required: true },
          { key: 'netBankingUser', label: 'Net Banking Username', type: 'text', required: true },
          { key: 'netBankingPassword', label: 'Net Banking Password', type: 'password', required: true },
          { key: 'transactionPin', label: 'Transaction PIN', type: 'password' },
          { key: 'mobilePin', label: 'Mobile Banking PIN', type: 'password' },
        ];
      case 'government':
        return [
          { key: 'documentType', label: 'Document Type', type: 'select', options: ['PAN Card', 'Aadhaar Card', 'Passport', 'UAN', 'Driving License', 'Voter ID', 'Ration Card'], required: true },
          { key: 'documentNumber', label: 'Document Number', type: 'text', required: true },
          { key: 'holderName', label: 'Name on Document', type: 'text', required: true },
          { key: 'issueDate', label: 'Issue Date', type: 'date' },
          { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
          { key: 'issuingAuthority', label: 'Issuing Authority', type: 'text' },
        ];
      case 'insurance':
        return [
          { key: 'insuranceType', label: 'Insurance Type', type: 'select', options: ['Health Insurance', 'Life Insurance', 'Term Insurance', 'Motor Insurance', 'Home Insurance', 'Travel Insurance'], required: true },
          { key: 'policyNumber', label: 'Policy Number', type: 'text', required: true },
          { key: 'provider', label: 'Insurance Provider', type: 'text', required: true },
          { key: 'policyHolderName', label: 'Policy Holder Name', type: 'text', required: true },
          { key: 'sumAssured', label: 'Sum Assured', type: 'number' },
          { key: 'premiumAmount', label: 'Premium Amount', type: 'number' },
          { key: 'premiumFrequency', label: 'Premium Frequency', type: 'select', options: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'] },
          { key: 'policyStartDate', label: 'Policy Start Date', type: 'date' },
          { key: 'policyEndDate', label: 'Policy End Date', type: 'date' },
          { key: 'nominee', label: 'Nominee Name', type: 'text' },
          { key: 'agentName', label: 'Agent Name', type: 'text' },
          { key: 'agentContact', label: 'Agent Contact', type: 'tel' },
        ];
      case 'investment':
        return [
          { key: 'investmentType', label: 'Investment Type', type: 'select', options: ['Mutual Fund', 'Stock', 'Demat Account', 'FD', 'RD', 'PPF', 'EPF', 'NPS/PRAN', 'Gold', 'Crypto'], required: true },
          { key: 'name', label: 'Investment Name', type: 'text', required: true },
          { key: 'platform', label: 'Platform/Broker', type: 'text' },
          { key: 'accountNumber', label: 'Account/Folio Number', type: 'text' },
          { key: 'amountInvested', label: 'Amount Invested', type: 'number' },
          { key: 'currentValue', label: 'Current Value', type: 'number' },
          { key: 'purchaseDate', label: 'Purchase Date', type: 'date' },
          { key: 'maturityDate', label: 'Maturity Date', type: 'date' },
        ];
      case 'card':
        return [
          { key: 'cardType', label: 'Card Type', type: 'select', options: ['Credit Card', 'Debit Card'], required: true },
          { key: 'bankName', label: 'Bank Name', type: 'text', required: true },
          { key: 'cardNumber', label: 'Card Number', type: 'text', required: true },
          { key: 'cardHolderName', label: 'Card Holder Name', type: 'text', required: true },
          { key: 'expiryDate', label: 'Expiry Date', type: 'month', required: true },
          { key: 'cvv', label: 'CVV', type: 'password', required: true },
          { key: 'pin', label: 'PIN', type: 'password' },
          { key: 'creditLimit', label: 'Credit Limit', type: 'number' },
          { key: 'billingDate', label: 'Billing Date', type: 'number' },
          { key: 'dueDate', label: 'Due Date', type: 'number' },
        ];
      default:
        return [];
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      tags,
      id: editData?.id || Date.now().toString(),
      createdAt: editData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSave(finalData);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative glass-dark rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editData ? 'Edit' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1)}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {getFormFields().map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((option) => (
                        <option key={option} value={option} className="bg-dark-800">
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                      placeholder={field.label}
                    />
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData[field.key] || false}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })}
                        className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-white">{field.label}</span>
                    </label>
                  ) : (
                    <div>
                      <input
                        type={field.type}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        required={field.required}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                        placeholder={field.label}
                      />
                      {field.type === 'password' && <PasswordStrengthMeter password={formData[field.key] || ''} />}
                    </div>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="Add tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-600/20 text-primary-400 text-sm rounded-full flex items-center gap-2 cursor-pointer hover:bg-primary-600/30 transition-colors"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X size={12} />
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 gradient-primary text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  {editData ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddCredentialModal;