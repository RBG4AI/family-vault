import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { storage } from '../utils/storage';
import CredentialCard from './CredentialCard';
import AddCredentialModal from './AddCredentialModal';
import SmartSearch from './SmartSearch';
import { useI18n } from '../context/I18nContext';

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

const inDateRange = (iso, range) => {
  if (!range || !iso) return !range;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return false;
  const days = { week: 7, month: 31, year: 366 }[range];
  if (!days) return true;
  return Date.now() - then <= days * 24 * 60 * 60 * 1000;
};

const inAmountRange = (amount, range) => {
  if (!range) return true;
  if (amount === null) return false;
  if (range === '0-1000') return amount >= 0 && amount <= 1000;
  if (range === '1000-10000') return amount > 1000 && amount <= 10000;
  if (range === '10000+') return amount > 10000;
  return true;
};

const CredentialsSection = ({ type, title }) => {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [advanced, setAdvanced] = useState({ dateRange: '', amountRange: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

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
    let filtered = items;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) => value?.toString().toLowerCase().includes(q))
      );
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
    setFilteredItems(filtered);
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
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    storage.set(type, updatedItems);
  };

  const getAllTags = () => {
    const tags = new Set();
    items.forEach((item) => item.tags?.forEach((tag) => tags.add(tag)));
    return ['All', ...Array.from(tags)];
  };

  const isEmptyVault = items.length === 0;
  const isFilteredEmpty = !isEmptyVault && filteredItems.length === 0;

  return (
    <div className="p-4 md:p-6 mt-12 md:mt-0">
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
        {!isEmptyVault && (
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
        />
      )}

      {filteredItems.length === 0 ? (
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 6) * 0.03 }}
            >
              <CredentialCard credential={item} onEdit={handleEdit} onDelete={handleDelete} />
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
