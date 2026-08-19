import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoLogout } from './hooks/useAutoLogout';
import { useVaultContext } from './context/VaultContext';
import VaultList from './components/VaultList';
import CreateVault from './components/CreateVault';
import UnlockScreen from './components/UnlockScreen';
import RecoveryUnlock from './components/RecoveryUnlock';
import RecoveryKeyScreen from './components/RecoveryKeyScreen';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CredentialsSection from './components/CredentialsSection';
import PeopleSection from './components/PeopleSection';
import VitalsSection from './components/VitalsSection';
import Settings from './components/Settings';
import QuickActions from './components/QuickActions';
import OfflineIndicator from './components/OfflineIndicator';
import AmbientBackground from './components/AmbientBackground';
import { storage } from './utils/storage';
import { useI18n } from './context/I18nContext';

function App() {
  const vault = useVaultContext();
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState('dashboard');
  const autoLockMinutes = vault.unlocked ? storage.get('settings')?.autoLockMinutes || 2 : 2;
  const secondsLeft = useAutoLogout(
    vault.lock,
    autoLockMinutes,
    vault.unlocked && vault.phase === 'unlocked'
  );

  if (!globalThis.isSecureContext || !globalThis.crypto?.subtle) {
    return (
      <AmbientBackground>
        <div className="min-h-screen flex items-center justify-center p-6 text-center text-white">
          <div className="max-w-md space-y-3 glass-panel rounded-3xl p-8">
            <h1 className="font-display text-2xl">Secure context required</h1>
            <p className="text-white/50">Open this vault on localhost or HTTPS so encryption can run in the browser.</p>
          </div>
        </div>
      </AmbientBackground>
    );
  }

  if (vault.phase === 'loading') {
    return (
      <AmbientBackground>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-cyan-300 border-t-transparent rounded-full" />
        </div>
      </AmbientBackground>
    );
  }

  if (vault.phase === 'list') {
    return (
      <AmbientBackground>
        <VaultList vaults={vault.vaults} onSelect={vault.selectVault} onCreate={vault.startCreate} onImport={vault.importEncryptedBackup} />
      </AmbientBackground>
    );
  }

  if (vault.phase === 'create') {
    return (
      <AmbientBackground>
        <CreateVault onCreate={vault.handleCreate} onBack={vault.backToList} busy={vault.busy} error={vault.error} />
      </AmbientBackground>
    );
  }

  if (vault.phase === 'unlock') {
    return (
      <AmbientBackground>
        <UnlockScreen vault={vault.selectedVault} onUnlock={vault.handleUnlock} onBack={vault.backToList} onRecovery={vault.startRecovery} busy={vault.busy} error={vault.error} />
      </AmbientBackground>
    );
  }

  if (vault.phase === 'recovery') {
    return (
      <AmbientBackground>
        <RecoveryUnlock vault={vault.selectedVault} onReset={vault.handleRecoveryReset} onBack={() => vault.selectVault(vault.selectedId)} busy={vault.busy} error={vault.error} />
      </AmbientBackground>
    );
  }

  if (vault.phase === 'recovery-shown') {
    return (
      <AmbientBackground>
        <RecoveryKeyScreen recoveryKey={vault.recoveryKey} onConfirm={vault.confirmRecoverySaved} />
      </AmbientBackground>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'people':
        return <PeopleSection />;
      case 'vitals':
        return <VitalsSection />;
      case 'vehicles':
        return <CredentialsSection type="vehicles" title={t('nav.vehicles')} />;
      case 'properties':
        return <CredentialsSection type="properties" title={t('nav.properties')} />;
      case 'credentials':
        return <CredentialsSection type="credentials" title={t('nav.credentials')} />;
      case 'emails':
        return <CredentialsSection type="emails" title={t('nav.emails')} />;
      case 'banking':
        return <CredentialsSection type="banking" title={t('nav.banking')} />;
      case 'cards':
        return <CredentialsSection type="cards" title={t('nav.cards')} />;
      case 'government':
        return <CredentialsSection type="government" title={t('nav.government')} />;
      case 'insurance':
        return <CredentialsSection type="insurance" title={t('nav.insurance')} />;
      case 'investments':
        return <CredentialsSection type="investments" title={t('nav.investments')} />;
      case 'notes':
        return <CredentialsSection type="notes" title={t('nav.notes')} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const handleQuickAction = (actionId) => {
    if (actionId === 'add-credential') setActiveSection('credentials');
    if (actionId === 'search') setActiveSection('credentials');
    if (actionId === 'export') setActiveSection('settings');
    if (actionId === 'security-check') setActiveSection('dashboard');
  };

  return (
    <AmbientBackground>
      <div className="min-h-screen flex">
        <OfflineIndicator />
        {secondsLeft !== null && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-300 text-dark-900 px-4 py-2 rounded-full text-sm font-medium">
            Locking in {secondsLeft}s
          </div>
        )}
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onLock={vault.lock}
          vaultName={vault.meta?.name}
        />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
        <QuickActions onAction={handleQuickAction} />
      </div>
    </AmbientBackground>
  );
}

export default App;
