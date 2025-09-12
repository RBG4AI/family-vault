import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Eye, Smartphone } from 'lucide-react';

const BiometricAuth = ({ onAuth }) => {
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    if ('credentials' in navigator && 'create' in navigator.credentials) {
      setBiometricSupported(true);
      const enabled = localStorage.getItem('biometric_enabled') === 'true';
      setBiometricEnabled(enabled);
    }
  };

  const enableBiometric = async () => {
    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "Vault App" },
          user: {
            id: new Uint8Array(16),
            name: "user@vault.app",
            displayName: "Vault User"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      });

      if (credential) {
        localStorage.setItem('biometric_enabled', 'true');
        localStorage.setItem('biometric_credential', credential.id);
        setBiometricEnabled(true);
      }
    } catch (error) {
      alert('Biometric setup failed: ' + error.message);
    }
  };

  const authenticateWithBiometric = async () => {
    try {
      const credentialId = localStorage.getItem('biometric_credential');
      if (!credentialId) return;

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [{
            id: new TextEncoder().encode(credentialId),
            type: 'public-key'
          }],
          userVerification: "required"
        }
      });

      if (assertion) {
        onAuth(true);
      }
    } catch (error) {
      alert('Biometric authentication failed');
    }
  };

  if (!biometricSupported) {
    return (
      <div className="glass-dark rounded-xl p-6">
        <div className="text-center">
          <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Biometric authentication not supported on this device</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Fingerprint className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Biometric Authentication</h3>
      </div>

      {!biometricEnabled ? (
        <div className="text-center">
          <p className="text-gray-400 mb-4">Enable biometric login for enhanced security</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={enableBiometric}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Enable Biometric Login
          </motion.button>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Fingerprint className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-green-400 mb-4">Biometric authentication enabled</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={authenticateWithBiometric}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            Authenticate with Biometric
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default BiometricAuth;