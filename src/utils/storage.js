import { getVaultData, updateVaultData } from '../storage/session';
import { copySecret } from './clipboard';

export const storage = {
  get: (key) => {
    const data = getVaultData();
    if (!data) return key ? null : {};
    return key ? (data[key] ?? null) : data;
  },

  set: (key, value) => {
    updateVaultData((current) => ({
      ...current,
      [key]: value,
    }));
  },

  remove: (key) => {
    updateVaultData((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  },
};

export const copyToClipboard = copySecret;
