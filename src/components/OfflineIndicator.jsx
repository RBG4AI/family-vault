import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const OfflineIndicator = () => {
  const { t } = useI18n();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-20 right-4 z-50 bg-amber-300 text-dark-900 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm">{t('pwa.offline')}</span>
    </div>
  );
};

export default OfflineIndicator;