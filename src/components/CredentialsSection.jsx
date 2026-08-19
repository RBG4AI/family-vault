import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { storage } from '../utils/storage';
import CredentialCard from './CredentialCard';
import AddCredentialModal from './AddCredentialModal';
import SmartSearch from './SmartSearch';
import { useI18n } from '../context/I18nContext';
import { useToast } from '../context/ToastContext';

const FORM_TYPE = {
  credentials: 'app',
  emails: 'email',
  cards: 'card',
  banking: 'banking',
  government: 'government',
  insurance: 'insurance',
  investments: 'investment',
  notes: 'note',
  vehicles: 'vehicle',
  properties: 'property',
};

const itemAmount = (item) => {
  const raw = item.currentValue ?? item.amountInvested ?? item.sumAssured ?? item.premiumAmount ?? item.creditLimit ?? item.amount;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

const itemDate = (item) => item.updatedAt || item.createdAt || item.purchaseDate || item.maturityDate || null;

const SECRET_SEARCH_KEYS = new Set([
  'password',
  'cvv',
  'pin',
  'netBankingPassword',
  'transactionPin',
  'mobilePin',
  'content',
]);

const searchableText = (item) =>
  Object.entries(item)
    .filter(([key]) => !SECRET_SEARCH_KEYS.has(key) && key !== 'id')
    .map(([, value]) => value)
    .filter((value) => value !== undefined && value !== null)
    .join(' ')
    .toLowerCase();

const inDateRange = (iso, range) => {
  if (!range) return true;
  if (!iso) return true;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return true;
  const days = { week: 7, month: 31, year: 366 }[range];
  if (!days) return true;
  return Date.now() - then <= days * 24 * 60 * 60 * 1000;
};

const inAmountRange = (amount, range) => {
  if (!range) return true;
  if (amount === null) return true;
  if (range === '0-1000') return amount >= 0 && amount <= 1000;
  if (range === '1000-10000') return amount > 1000 && amount < 10000;
  if (range === '10000+') return amount >= 10000;
  return true;
};

const AMOUNT_TYPES = new Set(['investments', 'insurance', 'cards']);

const CredentialsSection = ({ type, title, onNavigate, focusId, onFocusHandled }) => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [advanced, setAdvanced] = useState({ dateRange: '', amountRange: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  const loadItems = useCallback(() => {
    setItems(storage.get(type) || []);
  }, [type]);

  useEffect(() => {
    loadItems();
    setSearchTerm('');
    setSelectedTag('All');
    setAdvanced({ dateRange: '', amountRange: '' });
  }, [type, loadItems]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) loadItems();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadItems]);

  useEffect(() => {
    if (!focusId) return undefined;
    setSearchTerm('');
    setSelectedTag('All');
    setAdvanced({ dateRange: '', amountRange: '' });
    setHighlightId(focusId);
    const scrollTimer = window.setTimeout(() => {
      document.getElementById(`record-${focusId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onFocusHandled?.();
    }, 160);
    const clearTimer = window.setTimeout(() => setHighlightId(null), 3200);
    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(clearTimer);
    };
  }, [focusId, onFocusHandled]);

  const filteredItems = useMemo(() => {
    let filtered = items;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => searchableText(item).includes(q));
    }
    if (selectedTag !== 'All') {
      filtered = filtered.filter((item) => item.tags?.includes(selectedTag));
    }
    if (advanced.dateRange) {
      filtered = filtered.filter((item) => inDateRange(itemDate(item), advanced.dateRange));
    }
    if (advanced.amountRange) {
      filtered = filtered.filter((item) => inAmountRange(itemAmount(item), advanced.amountRange));
    }
    return filtered;
  }, [items, searchTerm, selectedTag, advanced]);

  const handleSave = (data) => {
    const existingIndex = items.findIndex((item) => item.id === data.id);
    const updatedItems = existingIndex >= 0
      ? items.map((item, index) => (index === existingIndex ? data : item))
      : [...items, data];
    setItems(updatedItems);
    storage.set(type, updatedItems);
    setEditData(null);
  };

  const handleEdit = (item) => {
    setEditData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const removed = items.find((item) => item.id === id);
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    storage.set(type, updatedItems);
    if (!removed) return;
    toast(t('common.deleted'), {
      undoLabel: t('common.undo'),
      undo: () => {
        const current = storage.get(type) || [];
        if (current.some((item) => item.id === removed.id)) return;
        const next = [...current, removed];
        storage.set(type, next);
        setItems(next);
      },
    });
  };

  const getAllTags = () => {
    const tags = new Set();
    items.forEach((item) => item.tags?.forEach((tag) => tags.add(tag)));
    return ['All', ...Array.from(tags)];
  };

  const isEmptyVault = items.length === 0;
  const isFilteredEmpty = !isEmptyVault && filteredItems.length === 0;
  const people = storage.get('people') || [];
  const needPeople = people.length === 0 && isEmptyVault && type !== 'notes';

  return (
    <div className="p-4 md:p-6 mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-cyan-300/70 mb-2">{t('nav.vault')}</p>
          <h1 className="font-display text-2xl md:text-4xl text-white mb-2">{title}</h1>
          <p className="text-white/45">{filteredItems.length} {t('common.items')}</p>
        </div>
        {!isEmptyVault && !needPeople && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setEditData(null); setIsModalOpen(true); }}
            className="btn-primary"
          >
            <Plus size={20} />
            {t('common.add')}
          </motion.button>
        )}
      </motion.div>

      {!isEmptyVault && (
        <SmartSearch
          onSearch={setSearchTerm}
          onFilter={setAdvanced}
          tags={getAllTags()}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          showAmount={AMOUNT_TYPES.has(type)}
        />
      )}

      {needPeople ? (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <h3 className="font-display text-2xl text-white mb-2">{t('dash.addFamilyTitle')}</h3>
          <p className="text-white/45 mb-6">{t('people.empty')}</p>
          <button type="button" onClick={() => onNavigate?.('people')} className="btn-primary">
            {t('dash.addFamily')}
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 opacity-20 glow-primary">
            <Plus size={32} />
          </div>
          <h3 className="font-display text-2xl text-white mb-2">{t('empty.none')}</h3>
          <p className="text-white/45 mb-6">{isFilteredEmpty ? t('empty.filtered') : t('empty.addFirst')}</p>
          {isEmptyVault && (
            <button onClick={() => { setEditData(null); setIsModalOpen(true); }} className="btn-primary">
              {t('empty.addItem')}
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              id={`record-${item.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 6) * 0.03 }}
            >
              <CredentialCard credential={item} onEdit={handleEdit} onDelete={handleDelete} highlighted={highlightId === item.id} />
            </motion.div>
          ))}
        </div>
      )}

      <AddCredentialModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSave={handleSave}
        editData={editData}
        type={FORM_TYPE[type] || type.slice(0, -1)}
      />
    </div>
  );
};

export default CredentialsSection;
