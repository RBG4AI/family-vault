import React from 'react';
import { useI18n } from '../context/I18nContext';

const LanguageSwitch = ({ className = '' }) => {
  const { lang, setLang, languages, t } = useI18n();

  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-[0.16em] text-white/35 mb-2">{t('settings.language')}</p>
      <div className="flex gap-2">
        {Object.entries(languages).map(([code, dict]) => (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              lang === code
                ? 'border-cyan-300/40 bg-cyan-300/15 text-white'
                : 'border-white/10 text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {dict.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitch;
