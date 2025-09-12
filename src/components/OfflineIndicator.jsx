import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
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
    <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm">Offline Mode</span>
    </div>
  );
};

export default OfflineIndicator;