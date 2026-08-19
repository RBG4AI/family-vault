import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const BackButton = ({ onClick }) => {
  const { t } = useI18n();
  if (!onClick) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white mb-4 -ml-1 px-1 py-1 rounded-lg"
    >
      <ArrowLeft size={16} />
      {t('common.back')}
    </button>
  );
};

export default BackButton;
