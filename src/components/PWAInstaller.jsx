import React from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { useI18n } from '../context/I18nContext';

const PWAInstaller = () => {
  const { t } = useI18n();
  const { canInstall, isInstalled, isOnline, installApp } = usePWA();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-semibold text-white">{t('pwa.title')}</h3>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-400" />
          )}
          <span className={`text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
            {isOnline ? t('pwa.online') : t('pwa.offline')}
          </span>
        </div>

        {isInstalled ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-green-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">{t('pwa.installedTitle')}</h4>
            <p className="text-white/45 text-sm">{t('pwa.installedBody')}</p>
          </div>
        ) : canInstall ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">{t('pwa.installTitle')}</h4>
            <p className="text-white/45 text-sm mb-4">{t('pwa.installBody')}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={installApp}
              className="px-6 py-3 gradient-primary text-white rounded-xl font-medium"
            >
              {t('pwa.install')}
            </motion.button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">{t('pwa.safariTitle')}</h4>
            <p className="text-white/45 text-sm">{t('pwa.safariBody')}</p>
          </div>
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h4 className="font-medium text-blue-400 mb-2">{t('pwa.benefits')}</h4>
        <ul className="text-white/45 text-sm space-y-1">
          <li>• {t('pwa.benefit1')}</li>
          <li>• {t('pwa.benefit2')}</li>
          <li>• {t('pwa.benefit3')}</li>
        </ul>
      </div>
    </div>
  );
};

export default PWAInstaller;
