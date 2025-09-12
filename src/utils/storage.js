let currentProfile = null;

const getStorageKey = () => {
  return currentProfile ? `vault_data_${currentProfile.id}` : 'vault_data';
};

export const storage = {
  setProfile: (profile) => {
    currentProfile = profile;
  },
  
  get: (key) => {
    try {
      const storageKey = getStorageKey();
      const data = localStorage.getItem(storageKey);
      const parsed = data ? JSON.parse(data) : {};
      
      // Also check direct key storage for backward compatibility
      if (key && !parsed[key]) {
        const directData = localStorage.getItem(key);
        if (directData) {
          try {
            return JSON.parse(directData);
          } catch {
            return directData;
          }
        }
      }
      
      return key ? parsed[key] : parsed;
    } catch {
      return key ? null : {};
    }
  },

  set: (key, value) => {
    try {
      const storageKey = getStorageKey();
      const data = storage.get();
      data[key] = value;
      localStorage.setItem(storageKey, JSON.stringify(data));
      
      // Also store directly for backup
      localStorage.setItem(key, JSON.stringify(value));
      
      console.log(`Saved ${key}:`, value);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  remove: (key) => {
    try {
      const data = storage.get();
      delete data[key];
      localStorage.setItem(getStorageKey(), JSON.stringify(data));
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  clear: () => {
    localStorage.removeItem(getStorageKey());
  }
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};