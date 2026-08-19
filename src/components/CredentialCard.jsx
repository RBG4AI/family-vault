import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Copy, Edit, Trash2, Check } from 'lucide-react';
import { copyToClipboard, storage } from '../utils/storage';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../context/I18nContext';

const maskLast4 = (value) => {
  const text = String(value);
  if (text.length <= 4) return '••••';
  return `${'•'.repeat(Math.min(8, text.length - 4))}${text.slice(-4)}`;
};

const maskAll = (value) => '•'.repeat(Math.min(12, Math.max(6, String(value).length)));

const titleFor = (item) =>
  item.title ||
  item.bankName ||
  item.emailAddress ||
  item.name ||
  item.appName ||
  item.documentType ||
  item.insuranceType ||
  item.cardType ||
  item.provider ||
  item.registrationNumber ||
  item.policyNumber;

const SECRET_KEYS = new Set(['password', 'cvv', 'pin', 'netBankingPassword', 'transactionPin', 'mobilePin']);
const LAST4_KEYS = new Set(['accountNumber', 'cardNumber', 'documentNumber', 'policyNumber']);

const fieldsFor = (item) =>
  [
    ['username', item.username],
    ['emailAddress', item.emailAddress],
    ['recoveryEmail', item.recoveryEmail],
    ['password', item.password],
    ['accountNumber', item.accountNumber],
    ['ifscCode', item.ifscCode],
    ['customerId', item.customerId],
    ['netBankingUser', item.netBankingUser],
    ['cardNumber', item.cardNumber],
    ['cvv', item.cvv],
    ['pin', item.pin],
    ['expiryDate', item.expiryDate],
    ['creditLimit', item.creditLimit],
    ['billingDate', item.billingDate],
    ['dueDate', item.dueDate],
    ['documentNumber', item.documentNumber],
    ['holderName', item.holderName],
    ['policyNumber', item.policyNumber],
    ['policyEndDate', item.policyEndDate],
    ['sumAssured', item.sumAssured],
    ['currentValue', item.currentValue],
    ['amountInvested', item.amountInvested],
    ['platform', item.platform],
    ['registrationNumber', item.registrationNumber],
    ['insurer', item.insurer],
    ['insuranceExpiry', item.insuranceExpiry],
    ['pucExpiry', item.pucExpiry],
    ['rcExpiry', item.rcExpiry],
    ['address', item.address],
    ['taxDueDate', item.taxDueDate],
    ['vehicleType', item.vehicleType],
    ['propertyType', item.propertyType],
    ['content', item.content || item.notes],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '').slice(0, 8);

const CredentialCard = ({ credential, onEdit, onDelete }) => {
  const [revealed, setRevealed] = useState({});
  const [copied, setCopied] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();
  const people = storage.get('people') || [];
  const person = people.find((item) => item.id === credential.personId);

  useEffect(() => {
    if (!confirmDelete) return undefined;
    const timer = window.setTimeout(() => setConfirmDelete(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmDelete]);

  const handleCopy = async (text, field) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(field);
      toast(t('common.copied'));
      setTimeout(() => setCopied(''), 2000);
    }
  };

  const subtitle =
    person?.name ||
    credential.username ||
    credential.emailAddress ||
    credential.holderName ||
    credential.policyHolderName ||
    credential.registrationNumber ||
    t('common.storedSecurely');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel rounded-2xl md:rounded-3xl p-4 md:p-6 hover:border-white/15 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 pr-3">
          <h3 className="text-base md:text-lg font-semibold text-white mb-1 truncate">{titleFor(credential) || t('common.untitled')}</h3>
          <p className="text-white/45 text-xs md:text-sm truncate">{subtitle}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={() => onEdit(credential)} className="p-2 text-white/40 hover:text-cyan-300 hover:bg-white/5 rounded-lg" aria-label={t('common.edit')}>
            <Edit size={16} />
          </button>
          {confirmDelete ? (
            <button
              type="button"
              onClick={() => onDelete(credential.id)}
              className="px-2 text-xs text-rose-300 hover:bg-rose-500/20 rounded-lg"
            >
              {t('people.confirmDelete')}
            </button>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="p-2 text-white/40 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg" aria-label={t('common.delete')}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {fieldsFor(credential).map(([key, value]) => {
          const isSecret = SECRET_KEYS.has(key);
          const shown = revealed[key];
          const display = !isSecret && !LAST4_KEYS.has(key)
            ? String(value)
            : shown
              ? String(value)
              : LAST4_KEYS.has(key)
                ? maskLast4(value)
                : maskAll(value);
          return (
            <div key={key} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/35">{t(`field.${key}`)}</p>
                <p className="text-white font-mono text-sm truncate">{display}</p>
              </div>
              {(isSecret || LAST4_KEYS.has(key)) && (
                <button
                  type="button"
                  aria-label={shown ? t('common.hide') : t('common.reveal')}
                  onClick={() => setRevealed((current) => ({ ...current, [key]: !current[key] }))}
                  className="text-white/40 hover:text-white"
                >
                  {shown ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
              <button
                type="button"
                aria-label={t('common.copy')}
                onClick={() => handleCopy(String(value), key)}
                className="text-white/40 hover:text-white"
              >
                {copied === key ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          );
        })}

        {credential.tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap pt-1">
            {credential.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-cyan-400/10 text-cyan-200/80 text-xs rounded-full">
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
