import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import PasswordGenerator from './PasswordGenerator';
import { storage } from '../utils/storage';
import { validateField } from '../utils/validation';
import { duplicateDocumentError } from '../utils/duplicateId';
import { useI18n } from '../context/I18nContext';
import SecretInput from './SecretInput';

const AddCredentialModal = ({ isOpen, onClose, onSave, editData, type, defaultPersonId }) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({});
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [fieldError, setFieldError] = useState('');
  const people = storage.get('people') || [];

  useEffect(() => {
    if (!isOpen) return;
    setFieldError('');
    setNewTag('');
    if (editData) {
      setFormData(editData);
      setTags(editData.tags || []);
    } else {
      const linked = defaultPersonId || '';
      setFormData(type !== 'person' && linked ? { personId: linked } : {});
      setTags([]);
    }
  }, [editData, isOpen, type, defaultPersonId]);

  const getFormFields = () => {
    switch (type) {
      case 'email':
        return [
          { key: 'emailAddress', label: 'Email Address', type: 'email', required: true },
          { key: 'password', label: 'Password', type: 'password', required: true },
          { key: 'recoveryEmail', label: 'Recovery Email', type: 'email' },
          { key: 'recoveryPhone', label: 'Recovery Phone', type: 'tel' },
          { key: 'twoFactorEnabled', label: '2FA Enabled', type: 'checkbox' },
          { key: 'twoFactorCodes', label: '2FA backup codes', type: 'textarea' },
        ];
      case 'app':
        return [
          { key: 'appName', label: 'App/Website Name', type: 'text', required: true },
          { key: 'username', label: 'Username', type: 'text', required: true },
          { key: 'password', label: 'Password', type: 'password', required: true },
          { key: 'twoFactorEnabled', label: '2FA Enabled', type: 'checkbox' },
          { key: 'twoFactorCodes', label: '2FA backup codes', type: 'textarea' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ];
      case 'banking':
        return [
          { key: 'bankName', label: 'Bank Name', type: 'text', required: true },
          { key: 'accountNumber', label: 'Account Number', type: 'text', required: true },
          { key: 'ifscCode', label: 'IFSC Code', type: 'text', required: true },
          { key: 'nominee', label: 'Nominee Name', type: 'text' },
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
          { key: 'nominee', label: 'Nominee Name', type: 'text' },
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
      case 'note':
        return [
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'content', label: 'Secret note', type: 'textarea', required: true },
        ];
      case 'person':
        return [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'relation', label: 'Relation', type: 'select', options: ['Self', 'Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 'Other'] },
          { key: 'birthday', label: 'Birthday', type: 'date' },
          { key: 'phone', label: 'Phone', type: 'tel' },
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'bloodGroup', label: 'Blood group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] },
          { key: 'allergies', label: 'Allergies', type: 'text' },
          { key: 'emergencyPhone', label: 'Emergency phone', type: 'tel' },
          { key: 'doctorName', label: 'Doctor', type: 'text' },
          { key: 'lockerHint', label: 'Locker / emergency note', type: 'textarea' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ];
      case 'vehicle':
        return [
          { key: 'name', label: 'Vehicle name', type: 'text', required: true },
          { key: 'vehicleType', label: 'Type', type: 'select', options: ['Car', 'Bike', 'Scooter', 'Other'] },
          { key: 'registrationNumber', label: 'Registration number', type: 'text', required: true },
          { key: 'insurer', label: 'Insurer', type: 'text' },
          { key: 'policyNumber', label: 'Policy number', type: 'text' },
          { key: 'insuranceExpiry', label: 'Insurance expiry', type: 'date' },
          { key: 'pucExpiry', label: 'PUC expiry', type: 'date' },
          { key: 'rcExpiry', label: 'RC expiry', type: 'date' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ];
      case 'property':
        return [
          { key: 'name', label: 'Property name', type: 'text', required: true },
          { key: 'propertyType', label: 'Type', type: 'select', options: ['Home', 'Plot', 'Apartment', 'Shop', 'Other'] },
          { key: 'address', label: 'Address', type: 'textarea', required: true },
          { key: 'mapsLocation', label: 'Google Maps location', type: 'text', hint: 'field.mapsLocationHint' },
          { key: 'surveyNumber', label: 'Survey / registration number', type: 'text' },
          { key: 'taxDueDate', label: 'Tax due date', type: 'date' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ];
      case 'vital':
        return [
          { key: 'date', label: 'Date', type: 'date', required: true },
          { key: 'systolic', label: 'BP systolic', type: 'number' },
          { key: 'diastolic', label: 'BP diastolic', type: 'number' },
          { key: 'sugar', label: 'Blood sugar', type: 'number' },
          { key: 'weight', label: 'Weight (kg)', type: 'number' },
          { key: 'heartRate', label: 'Heart rate', type: 'number' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ];
      default:
        return [];
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error =
      validateField('ifscCode', formData.ifscCode) ||
      validateField('documentNumber', formData.documentNumber, formData) ||
      (type === 'government' ? duplicateDocumentError(formData, editData?.id) : '');
    if (error) {
      setFieldError(error);
      return;
    }
    const finalData = {
      ...formData,
      tags,
      id: editData?.id || crypto.randomUUID(),
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

  const requestClose = () => {
    const dirty =
      tags.length > 0 ||
      Object.entries(formData).some(([key, value]) => key !== 'personId' && value !== undefined && value !== '' && value !== false);
    if (dirty && !window.confirm(t('modal.discard'))) return;
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') requestClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, formData, tags]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={requestClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative glass-panel rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {t(`modal.${editData ? 'edit' : 'add'}.${type}`)}
              </h2>
              <button
                type="button"
                aria-label={t('common.cancel')}
                onClick={requestClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {type !== 'person' && people.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('common.member')}</label>
                  <select
                    value={formData.personId || ''}
                    onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                    className="field"
                  >
                    <option value="" className="bg-dark-800">{t('modal.notLinked')}</option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id} className="bg-dark-800">{person.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {getFormFields().map((field) => {
                const label = t(`field.${field.key}`);
                return (
                <div key={field.key}>
                  {field.type !== 'checkbox' && (
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {label} {field.required && <span className="text-red-400">*</span>}
                    </label>
                  )}
                  
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                      className="field"
                    >
                      <option value="">{t('modal.select', { label })}</option>
                      {field.options.map((option) => (
                        <option key={option} value={option} className="bg-dark-800">
                          {t(`option.${option}`)}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                      rows={3}
                      className="field resize-none"
                      placeholder={label}
                    />
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData[field.key] || false}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })}
                        className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-white">{label}</span>
                    </label>
                  ) : (
                    <div>
                      {field.type === 'password' ? (
                        <SecretInput
                          type="password"
                          value={formData[field.key] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          required={field.required}
                          name={`fv-item-${field.key}`}
                          className="field"
                          placeholder={label}
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.key] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          required={field.required}
                          autoComplete="off"
                          className="field"
                          placeholder={field.key === 'mapsLocation' ? t('field.mapsLocationPlaceholder') : label}
                        />
                      )}
                      {field.type === 'password' && <PasswordStrengthMeter password={formData[field.key] || ''} />}
                      {(field.key === 'password' || field.key === 'netBankingPassword') && (
                        <div className="mt-3">
                          <PasswordGenerator onUse={(password) => setFormData({ ...formData, [field.key]: password })} />
                        </div>
                      )}
                    </div>
                  )}
                  {field.hint ? <p className="text-white/40 text-xs mt-1.5">{t(field.hint)}</p> : null}
                </div>
                );
              })}

              {fieldError && <p className="text-red-400 text-sm">{t(fieldError)}</p>}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('modal.tags')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 field py-2"
                    placeholder={t('modal.addTag')}
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
                  onClick={requestClose}
                  className="flex-1 px-4 py-3 text-white/50 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editData ? t('common.update') : t('common.save')}
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