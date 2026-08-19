import React, { createContext, useContext } from 'react';
import { useVault } from '../hooks/useVault';

const VaultContext = createContext(null);

export const VaultProvider = ({ children }) => {
  const value = useVault();
  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
};

export const useVaultContext = () => {
  const value = useContext(VaultContext);
  if (!value) {
    throw new Error('useVaultContext must be used inside VaultProvider');
  }
  return value;
};
