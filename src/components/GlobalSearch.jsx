import React, { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { searchVault } from '../utils/vaultSearch';
import { useI18n } from '../context/I18nContext';

const GlobalSearch = ({ onNavigate, hidden }) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const hits = useMemo(() => searchVault(query), [query]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (hidden) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-4 right-[4.25rem] md:right-28 z-[60] p-3 glass-panel rounded-2xl text-white print:hidden print-hide"
        aria-label={t('search.global')}
      >
        <Search className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-24">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-label={t('nav.closeMenu')} />
          <div className="relative w-full max-w-lg glass-panel rounded-3xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Search className="text-white/40" size={18} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.globalPlaceholder')}
                className="field"
              />
              <button type="button" onClick={() => setOpen(false)} className="p-2 text-white/40" aria-label={t('common.cancel')}>
                <X size={18} />
              </button>
            </div>
            {query.trim().length >= 2 && hits.length === 0 && (
              <p className="text-white/40 text-sm px-1">{t('search.noHits')}</p>
            )}
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {hits.map((hit) => (
                <button
                  key={hit.id}
                  type="button"
                  onClick={() => {
                    onNavigate(hit.section, hit.itemId);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10"
                >
                  <p className="text-white text-sm truncate">{hit.title}</p>
                  <p className="text-white/40 text-xs">{t(`nav.${hit.section}`)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;
