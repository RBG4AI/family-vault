import React from 'react';
import { Info } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const StorageDisclaimer = ({ variant = 'short', className = '' }) => {
  const { t } = useI18n();
  const site = globalThis.location?.host || 'this site';
  const full = variant === 'full';

  return (
    <aside
      role="note"
      className={`rounded-2xl border border-amber-400/25 bg-amber-400/10 ${full ? 'p-5 space-y-2' : 'p-4'} ${className}`}
    >
      <div className="flex items-start gap-2">
        <Info className="text-amber-200 shrink-0 mt-0.5" size={16} />
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-amber-200/80 mb-1">{t('disclaimer.title')}</p>
          <p className={`text-amber-50/85 ${full ? 'text-sm leading-relaxed' : 'text-xs leading-relaxed'}`}>
            {t(full ? 'disclaimer.full' : 'disclaimer.short', { site })}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default StorageDisclaimer;
