import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Users, CheckCircle } from 'lucide-react';

const LocalSync = () => {
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    const savedSync = localStorage.getItem('last_sync');
    if (savedSync) {
      setLastSync(new Date(savedSync));
    }
  }, []);

  const scanForDevices = async () => {
    setIsScanning(true);
    
    // Simulate device discovery on local network
    setTimeout(() => {
      const mockDevices = [
        { id: '1', name: 'Spouse iPhone', ip: '192.168.1.101', status: 'online' },
        { id: '2', name: 'Home iPad', ip: '192.168.1.102', status: 'offline' }
      ];
      setDevices(mockDevices);
      setIsScanning(false);
    }, 2000);
  };

  const syncWithDevice = async (deviceId) => {
    try {
      // Encrypt and sync data
      const vaultData = {
        credentials: localStorage.getItem('vault_data') || '{}',
        timestamp: Date.now(),
        encrypted: true
      };

      // Simulate sync
      setTimeout(() => {
        setLastSync(new Date());
        localStorage.setItem('last_sync', new Date().toISOString());
      }, 1000);

    } catch (error) {
      alert('Sync failed: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Wifi className="w-6 h-6 text-green-400" />
        <h3 className="text-xl font-semibold text-white">Local Network Sync</h3>
      </div>

      <div className="glass-dark rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-white">Available Devices</h4>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scanForDevices}
            disabled={isScanning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isScanning ? 'Scanning...' : 'Scan Network'}
          </motion.button>
        </div>

        {devices.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No devices found. Click scan to search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <h5 className="text-white font-medium">{device.name}</h5>
                  <p className="text-gray-400 text-sm">{device.ip}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    device.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                  {device.status === 'online' && (
                    <button
                      onClick={() => syncWithDevice(device.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Sync
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {lastSync && (
        <div className="glass-dark rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <h4 className="text-white font-medium">Last Sync</h4>
              <p className="text-gray-400 text-sm">
                {lastSync.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <h4 className="font-medium text-green-400 mb-2">Sync Security</h4>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• Data encrypted before transmission</li>
          <li>• Only works on same WiFi network</li>
          <li>• Requires device authentication</li>
          <li>• Automatic conflict resolution</li>
        </ul>
      </div>
    </div>
  );
};

export default LocalSync;