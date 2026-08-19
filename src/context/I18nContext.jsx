import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TRANSLATIONS } from '../i18n/translations';

const LANG_KEY = 'vault_ui_lang';
const I18nContext = createContext(null);

const lookup = (dict, path) =>
  path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), dict);

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem(LANG_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* private mode */
    }
  }, []);

  const t = useCallback(
    (key) => lookup(TRANSLATIONS[lang], key) || lookup(TRANSLATIONS.en, key) || key,
    [lang]
  );

  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t, languages: TRANSLATIONS }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context) return context;
  return {
    lang: 'en',
    setLang: () => {},
    t: (key) => lookup(TRANSLATIONS.en, key) || key,
    languages: TRANSLATIONS,
  };
};
