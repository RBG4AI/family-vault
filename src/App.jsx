import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { useAutoLogout } from './hooks/useAutoLogout';
import LoginScreen from './components/LoginScreen';
import ProfileSelector from './components/ProfileSelector';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CredentialsSection from './components/CredentialsSection';
import ThemeToggle from './components/ThemeToggle';
import ImportExport from './components/ImportExport';
import QuickActions from './components/QuickActions';
import EmergencyAccess from './components/EmergencyAccess';
import OfflineIndicator from './components/OfflineIndicator';
import BiometricAuth from './components/BiometricAuth';
import SecureSharing from './components/SecureSharing';
import PWAInstaller from './components/PWAInstaller';
import LocalSync from './components/LocalSync';
import SharedProfile from './components/SharedProfile';
import DataExporter from './components/DataExporter';

function App() {
  const { isAuthenticated, isLoading, login, logout, currentProfile, showProfileSelector, selectProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  
  useAutoLogout(logout, 2);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (showProfileSelector) {
    return <ProfileSelector onSelectProfile={selectProfile} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'credentials':
        return <CredentialsSection type="credentials" title="Credentials" />;
      case 'emails':
        return <CredentialsSection type="emails" title="Email Accounts" />;
      case 'banking':
        return <CredentialsSection type="banking" title="Banking" />;
      case 'cards':
        return <CredentialsSection type="cards" title="Cards" />;
      case 'government':
        return <CredentialsSection type="government" title="Government IDs" />;
      case 'insurance':
        return <CredentialsSection type="insurance" title="Insurance" />;
      case 'investments':
        return <CredentialsSection type="investments" title="Investments" />;
      case 'settings':
        return (
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-dark rounded-2xl p-6"
            >
              <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
              <div className="space-y-6">
                <div className="glass-dark rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Simple Offline Mode</h3>
                  <p className="text-gray-400 text-sm mb-3">Your data is always saved locally on this device</p>
                  <button
                    onClick={() => {
                      // Cache current page
                      const html = document.documentElement.outerHTML;
                      localStorage.setItem('vault_cached_page', html);
                      alert('App cached! You can now use it offline.');
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Cache App for Offline Use
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Tap this button, then add to home screen</p>
                </div>
                <PWAInstaller />
                <SharedProfile />
                <LocalSync />
                <ThemeToggle />
                <DataExporter />
                <ImportExport />
                <EmergencyAccess />
                <BiometricAuth onAuth={() => {}} />
                <SecureSharing />
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <h3 className="text-white font-medium">Auto-lock</h3>
                    <p className="text-gray-400 text-sm">Lock vault after 2 minutes of inactivity</p>
                  </div>
                  <div className="w-12 h-6 bg-primary-600 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
                <button className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors">
                  Clear All Data
                </button>
              </div>
            </motion.div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'add-credential':
        setActiveSection('credentials');
        break;
      case 'search':
        // Focus search input
        break;
      case 'export':
        setActiveSection('settings');
        break;
      case 'security-check':
        setActiveSection('dashboard');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex">
      <OfflineIndicator />
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        onLogout={logout}
      />
      
      <main className="flex-1 overflow-y-auto md:ml-0 ml-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      <QuickActions onAction={handleQuickAction} />
    </div>
  );
}

export default App;