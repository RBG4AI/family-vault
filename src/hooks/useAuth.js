import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);

  useEffect(() => {
    const sessionProfile = sessionStorage.getItem('vault_profile');
    const sessionActive = sessionStorage.getItem('vault_session');
    
    if (sessionProfile && sessionActive) {
      const profile = JSON.parse(sessionProfile);
      setCurrentProfile(profile);
      storage.setProfile(profile);
      setIsAuthenticated(true);
    } else {
      setShowProfileSelector(true);
    }
    setIsLoading(false);
  }, []);

  const selectProfile = (profile) => {
    setCurrentProfile(profile);
    storage.setProfile(profile);
    sessionStorage.setItem('vault_profile', JSON.stringify(profile));
    setShowProfileSelector(false);
  };

  const login = (password) => {
    const storedPassword = storage.get('masterPassword');
    
    if (!storedPassword) {
      storage.set('masterPassword', password);
      sessionStorage.setItem('vault_session', 'active');
      setIsAuthenticated(true);
      return true;
    }
    
    if (storedPassword === password) {
      sessionStorage.setItem('vault_session', 'active');
      setIsAuthenticated(true);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('vault_session');
    sessionStorage.removeItem('vault_profile');
    setIsAuthenticated(false);
    setCurrentProfile(null);
    setShowProfileSelector(true);
  };

  return { isAuthenticated, isLoading, login, logout, currentProfile, showProfileSelector, selectProfile };
};