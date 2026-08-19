import React, { createContext, useContext, useMemo, useState } from 'react';
import { TRANSLATIONS } from '../i18n/translations';

const LANG_KEY = 'vault_ui_lang';
const I18nContext = createContext(null);

const lookup = (dict, path) =>
  path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), dict);

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => localStorage.getItem(LANG_KEY) || 'en');

  const setLang = (next) => {
    setLangState(next);
    localStorage.setItem(LANG_KEY, next);
  };

  const t = (key) => lookup(TRANSLATIONS[lang], key) || lookup(TRANSLATIONS.en, key) || key;

  const value = useMemo(() => ({ lang, setLang, t, languages: TRANSLATIONS }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () =>
  useContext(I18nContext) || {
    lang: 'en',
    setLang: () => {},
    t: (key) => lookup(TRANSLATIONS.en, key) || key,
    languages: TRANSLATIONS,
  };
