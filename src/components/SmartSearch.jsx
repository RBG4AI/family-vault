import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../context/I18nContext';

const SmartSearch = ({ onSearch, onFilter, tags = [], selectedTag = 'All', onTagChange, showAmount = false }) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '',
    amountRange: '',
  });

  useEffect(() => {
    onSearch(searchTerm);
  }, [searchTerm, onSearch]);

  useEffect(() => {
    onFilter(filters);
  }, [filters, onFilter]);

  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" size={20} />
        <input
          type="search"
          placeholder={t('search.placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full field pl-10 pr-12"
        />
        <button
          type="button"
          aria-label={t('search.filter')}
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
            showFilters ? 'text-cyan-300 bg-cyan-400/20' : 'text-white/45 hover:text-white'
          }`}
        >
          <Filter size={16} />
        </button>
      </div>

      {tags.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagChange?.(tag)}
              className={`px-3 py-1 rounded-full text-xs ${
                selectedTag === tag ? 'bg-cyan-400/20 text-cyan-100' : 'bg-white/5 text-white/55 hover:text-white'
              }`}
            >
              {tag === 'All' ? t('common.all') : tag}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel rounded-2xl p-4 space-y-3 overflow-hidden"
          >
            <div className={`grid grid-cols-1 ${showAmount ? 'md:grid-cols-2' : ''} gap-3`}>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="field"
                aria-label={t('search.allTime')}
              >
                <option value="">{t('search.allTime')}</option>
                <option value="week">{t('search.week')}</option>
                <option value="month">{t('search.month')}</option>
                <option value="year">{t('search.year')}</option>
              </select>
              {showAmount && (
                <select
                  value={filters.amountRange}
                  onChange={(e) => setFilters({ ...filters, amountRange: e.target.value })}
                  className="field"
                  aria-label={t('search.anyAmount')}
                >
                  <option value="">{t('search.anyAmount')}</option>
                  <option value="0-1000">₹0 – ₹1,000</option>
                  <option value="1000-10000">₹1,000 – ₹10,000</option>
                  <option value="10000+">₹10,000+</option>
                </select>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSearch;
