import React, { useState, useEffect } from 'react';
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

const CredentialsSection = ({ type, title }) => {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    loadItems();
  }, [type]);

  useEffect(() => {
    // Reload items when returning to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadItems();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [type]);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedTag]);

  const loadItems = () => {
    const data = storage.get(type) || [];
    setItems(data);
  };

  const filterItems = () => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedTag !== 'All') {
      filtered = filtered.filter(item =>
        item.tags?.includes(selectedTag)
      );
    }

    setFilteredItems(filtered);
  };

  const handleSave = (data) => {
    const existingIndex = items.findIndex(item => item.id === data.id);
    let updatedItems;

    if (existingIndex >= 0) {
      updatedItems = [...items];
      updatedItems[existingIndex] = data;
    } else {
      updatedItems = [...items, data];
    }

    setItems(updatedItems);
    storage.set(type, updatedItems);
    setEditData(null);
  };

  const handleEdit = (item) => {
    setEditData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    storage.set(type, updatedItems);
  };

  const getAllTags = () => {
    const tags = new Set();
    items.forEach(item => {
      item.tags?.forEach(tag => tags.add(tag));
    });
    return ['All', ...Array.from(tags)];
  };

  return (
    <div className="p-4 md:p-6 mt-12 md:mt-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-cyan-300/70 mb-2">Vault</p>
          <h1 className="font-display text-2xl md:text-4xl text-white mb-2">{title}</h1>
          <p className="text-white/45">{filteredItems.length} {t('common.items')}</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          {t('common.add')}
        </motion.button>
      </motion.div>

      <SmartSearch 
        onSearch={setSearchTerm}
        onFilter={(filters) => {
          // Handle advanced filters here
          if (filters.category) {
            // Filter by category logic
          }
        }}
      />

      {filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 opacity-20 glow-primary">
            <Plus size={32} />
          </div>
          <h3 className="font-display text-2xl text-white mb-2">No {title.toLowerCase()} yet</h3>
          <p className="text-white/45 mb-6">
            {searchTerm || selectedTag !== 'All' 
              ? 'Try adjusting your search or filters' 
              : `Add your first ${title.toLowerCase()} — it stays encrypted in this vault`
            }
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            Add {type === 'credentials' ? 'Credential' : type === 'emails' ? 'Email' : type === 'banking' ? 'Bank Account' : type === 'cards' ? 'Card' : type === 'government' ? 'Government ID' : type === 'insurance' ? 'Insurance Policy' : type === 'investments' ? 'Investment' : type === 'notes' ? 'Note' : 'Item'}
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CredentialCard
                credential={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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