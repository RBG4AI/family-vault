import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Copy, Edit, Trash2, Check } from 'lucide-react';
import { copyToClipboard, storage } from '../utils/storage';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../context/I18nContext';

const mask = (value, visibleDigits = 4) => {
  if (!value) return '';
  const text = String(value);
  if (text.length <= visibleDigits) return '••••';
  return `${'•'.repeat(Math.min(8, text.length - visibleDigits))}${text.slice(-visibleDigits)}`;
};

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
  'Untitled';

const hiddenByDefault = ['Password', 'CVV', 'PIN', 'Account', 'Card', 'Document', 'Policy'];

const fieldsFor = (item) => {
  const pairs = [
    ['Username', item.username],
    ['Email', item.emailAddress],
    ['Password', item.password],
    ['Account', item.accountNumber],
    ['IFSC', item.ifscCode],
    ['Customer ID', item.customerId],
    ['Card', item.cardNumber],
    ['CVV', item.cvv],
    ['PIN', item.pin],
    ['Document', item.documentNumber],
    ['Policy', item.policyNumber],
    ['Registration', item.registrationNumber],
    ['Insurer', item.insurer],
    ['Insurance', item.insuranceExpiry],
    ['PUC', item.pucExpiry],
    ['RC', item.rcExpiry],
    ['Address', item.address],
    ['Tax due', item.taxDueDate],
    ['Type', item.vehicleType || item.propertyType],
    ['Note', item.content || item.notes],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');

  return pairs.slice(0, 5);
};

const CredentialCard = ({ credential, onEdit, onDelete }) => {
  const [revealed, setRevealed] = useState({});
  const [copied, setCopied] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();
  const people = storage.get('people') || [];
  const person = people.find((item) => item.id === credential.personId);

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
    'Stored securely';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel rounded-2xl md:rounded-3xl p-4 md:p-6 hover:border-white/15 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 pr-3">
          <h3 className="text-base md:text-lg font-semibold text-white mb-1 truncate">{titleFor(credential)}</h3>
          <p className="text-white/45 text-xs md:text-sm truncate">{subtitle}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => onEdit(credential)} className="p-2 text-white/40 hover:text-cyan-300 hover:bg-white/5 rounded-lg" aria-label="Edit">
            <Edit size={16} />
          </button>
          {confirmDelete ? (
            <button
              onClick={() => onDelete(credential.id)}
              className="px-2 text-xs text-rose-300 hover:bg-rose-500/20 rounded-lg"
            >
              {t('common.delete')}
            </button>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="p-2 text-white/40 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg" aria-label="Delete">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {fieldsFor(credential).map(([label, value]) => {
          const isSecret = hiddenByDefault.includes(label);
          const shown = revealed[label];
          return (
            <div key={label} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/35">{label}</p>
                <p className="text-white font-mono text-sm truncate">{isSecret && !shown ? mask(value) : String(value)}</p>
              </div>
              {isSecret && (
                <button onClick={() => setRevealed((current) => ({ ...current, [label]: !current[label] }))} className="text-white/40 hover:text-white">
                  {shown ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
              <button onClick={() => handleCopy(String(value), label)} className="text-white/40 hover:text-white">
                {copied === label ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
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
