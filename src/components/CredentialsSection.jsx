import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { storage } from '../utils/storage';
import CredentialCard from './CredentialCard';
import AddCredentialModal from './AddCredentialModal';
import SmartSearch from './SmartSearch';

const CredentialsSection = ({ type, title }) => {
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
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400">{filteredItems.length} items</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus size={20} />
          Add New
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
          <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
            <Plus size={32} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No {title.toLowerCase()} found</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedTag !== 'All' 
              ? 'Try adjusting your search or filters' 
              : `Add your first ${type} to get started`
            }
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Add {type === 'credentials' ? 'Credential' : type === 'emails' ? 'Email' : type === 'banking' ? 'Bank Account' : type === 'cards' ? 'Card' : type === 'government' ? 'Government ID' : type === 'insurance' ? 'Insurance Policy' : type === 'investments' ? 'Investment' : 'Item'}
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
        type={type === 'credentials' ? 'app' : type === 'emails' ? 'email' : type === 'cards' ? 'card' : type === 'banking' ? 'banking' : type === 'government' ? 'government' : type === 'insurance' ? 'insurance' : type === 'investments' ? 'investment' : type.slice(0, -1)}
      />
    </div>
  );
};

export default CredentialsSection;