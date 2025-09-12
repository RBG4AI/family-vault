import React from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const PWAInstaller = () => {
  const { canInstall, isInstalled, isOnline, installApp } = usePWA();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Mobile App</h3>
      </div>

      <div className="glass-dark rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-400" />
          )}
          <span className={`text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
            {isOnline ? 'Online' : 'Offline Mode'}
          </span>
        </div>

        {isInstalled ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-green-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">App Installed</h4>
            <p className="text-gray-400 text-sm">
              Vault is installed and ready to use offline
            </p>
          </div>
        ) : canInstall ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Install Vault App</h4>
            <p className="text-gray-400 text-sm mb-4">
              Install as mobile app for offline access and better security
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={installApp}
              className="px-6 py-3 gradient-primary text-white rounded-xl font-medium"
            >
              Install App
            </motion.button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">PWA Ready</h4>
            <p className="text-gray-400 text-sm">
              Use browser menu to "Add to Home Screen"
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h4 className="font-medium text-blue-400 mb-2">PWA Benefits</h4>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• Works completely offline</li>
          <li>• Install on multiple devices</li>
          <li>• Automatic background sync</li>
          <li>• Native app experience</li>
          <li>• No app store required</li>
        </ul>
      </div>
    </div>
  );
};

export default PWAInstaller;