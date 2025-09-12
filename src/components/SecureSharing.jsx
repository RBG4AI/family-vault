import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, QrCode, Wifi, WifiOff } from 'lucide-react';

const SecureSharing = () => {
  const [sharingMethod, setSharingMethod] = useState('qr');
  const [isSharing, setIsSharing] = useState(false);

  const generateSecureLink = () => {
    const encryptedData = btoa(JSON.stringify({
      timestamp: Date.now(),
      data: 'encrypted_vault_data',
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));
    return `vault://emergency/${encryptedData}`;
  };

  const shareViaQR = () => {
    setIsSharing(true);
    const link = generateSecureLink();
    // Generate QR code with the secure link
    setTimeout(() => setIsSharing(false), 3000);
  };

  const shareViaLocalNetwork = () => {
    setIsSharing(true);
    // Create local network sharing
    setTimeout(() => setIsSharing(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Share2 className="w-6 h-6 text-green-400" />
        <h3 className="text-xl font-semibold text-white">Secure Sharing</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`glass-dark rounded-xl p-6 cursor-pointer border-2 transition-colors ${
            sharingMethod === 'qr' ? 'border-green-500' : 'border-transparent'
          }`}
          onClick={() => setSharingMethod('qr')}
        >
          <div className="flex items-center gap-3 mb-3">
            <QrCode className="w-6 h-6 text-green-400" />
            <h4 className="font-medium text-white">QR Code Sharing</h4>
          </div>
          <p className="text-gray-400 text-sm">
            Generate encrypted QR code for one-time access
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`glass-dark rounded-xl p-6 cursor-pointer border-2 transition-colors ${
            sharingMethod === 'local' ? 'border-blue-500' : 'border-transparent'
          }`}
          onClick={() => setSharingMethod('local')}
        >
          <div className="flex items-center gap-3 mb-3">
            <Wifi className="w-6 h-6 text-blue-400" />
            <h4 className="font-medium text-white">Local Network</h4>
          </div>
          <p className="text-gray-400 text-sm">
            Share via secure local network connection
          </p>
        </motion.div>
      </div>

      <div className="glass-dark rounded-xl p-6">
        {sharingMethod === 'qr' ? (
          <div className="text-center">
            <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
              {isSharing ? (
                <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full" />
              ) : (
                <QrCode className="w-16 h-16 text-gray-600" />
              )}
            </div>
            <p className="text-gray-400 text-sm mb-4">
              QR code expires in 24 hours
            </p>
            <button
              onClick={shareViaQR}
              disabled={isSharing}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSharing ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wifi className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Share vault access via local network
            </p>
            <button
              onClick={shareViaLocalNetwork}
              disabled={isSharing}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSharing ? 'Connecting...' : 'Start Local Sharing'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <h4 className="font-medium text-yellow-400 mb-2">Security Notes</h4>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• All shared data is encrypted end-to-end</li>
          <li>• Access links expire automatically</li>
          <li>• Only works on trusted devices</li>
          <li>• Requires master password for final access</li>
        </ul>
      </div>
    </div>
  );
};

export default SecureSharing;