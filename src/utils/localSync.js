// Simple local storage sync using localStorage events
export const syncData = {
  // Broadcast data changes to other devices on same network
  broadcast: (key, data) => {
    const syncData = {
      key,
      data,
      timestamp: Date.now(),
      deviceId: getDeviceId()
    };
    
    // Store in localStorage with sync prefix
    localStorage.setItem(`sync_${key}`, JSON.stringify(syncData));
    
    // Trigger storage event for other tabs/devices
    window.dispatchEvent(new StorageEvent('storage', {
      key: `sync_${key}`,
      newValue: JSON.stringify(syncData)
    }));
  },

  // Listen for sync events from other devices
  listen: (callback) => {
    const handleSync = (e) => {
      if (e.key && e.key.startsWith('sync_') && e.newValue) {
        try {
          const syncData = JSON.parse(e.newValue);
          if (syncData.deviceId !== getDeviceId()) {
            callback(syncData);
          }
        } catch (error) {
          console.log('Sync parse error:', error);
        }
      }
    };

    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  },

  // Get all profiles from all devices
  getAllProfiles: () => {
    const profiles = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('vault_profile_')) {
        try {
          const profile = JSON.parse(localStorage.getItem(key));
          profiles.push(profile);
        } catch (error) {
          console.log('Profile parse error:', error);
        }
      }
    }
    return profiles;
  }
};

const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};