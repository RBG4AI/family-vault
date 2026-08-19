import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createVault,
  destroyActiveVault,
  exportEncryptedBackup,
  getSessionSnapshot,
  importEncryptedBackup,
  listAllVaults,
  lockVault,
  rotateRecoveryKey,
  subscribeVault,
  unlockVault,
  unlockWithRecovery,
  updateMasterPassword,
  wipeDevice,
} from '../storage/session';

export const useVault = () => {
  const [vaults, setVaults] = useState([]);
  const [phase, setPhase] = useState('loading');
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState('');
  const [session, setSession] = useState(getSessionSnapshot());

  const refreshVaults = useCallback(async () => {
    const items = await listAllVaults();
    setVaults(items);
    return items;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await refreshVaults();
        if (cancelled) return;
        setPhase(items.length ? 'list' : 'create');
      } catch {
        if (!cancelled) {
          setError('Could not open local vault storage.');
          setPhase('list');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshVaults]);

  useEffect(() => subscribeVault(() => setSession(getSessionSnapshot())), []);

  const selectVault = (id) => {
    setError('');
    setSelectedId(id);
    setPhase('unlock');
  };

  const startCreate = () => {
    setError('');
    setPhase('create');
  };

  const startRecovery = () => {
    setError('');
    setPhase('recovery');
  };

  const backToList = async () => {
    lockVault();
    setRecoveryKey('');
    setError('');
    setSelectedId(null);
    setPhase('list');
    await refreshVaults();
  };

  const handleCreate = async ({ name, kind, password }) => {
    setBusy(true);
    setError('');
    try {
      const created = await createVault({ name, kind, password });
      setRecoveryKey(created.recoveryKey);
      setPhase('recovery-shown');
      await refreshVaults();
    } catch (err) {
      setError(err.message || 'Could not create vault.');
    } finally {
      setBusy(false);
    }
  };

  const confirmRecoverySaved = () => {
    setRecoveryKey('');
    setPhase('unlocked');
  };

  const handleUnlock = async (password) => {
    setBusy(true);
    setError('');
    try {
      const result = await unlockVault(selectedId, password);
      if (result.migrated) {
        setRecoveryKey(result.recoveryKey);
        setPhase('recovery-shown');
      } else {
        setPhase('unlocked');
      }
    } catch (err) {
      setError(err.message || 'Unlock failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleRecoveryReset = async (key, nextPassword) => {
    setBusy(true);
    setError('');
    try {
      await unlockWithRecovery(selectedId, key, nextPassword);
      setPhase('unlocked');
    } catch (err) {
      setError(err.message || 'Recovery failed.');
    } finally {
      setBusy(false);
    }
  };

  const lock = async () => {
    lockVault();
    setPhase(selectedId ? 'unlock' : 'list');
    await refreshVaults();
  };

  const value = useMemo(
    () => ({
      vaults,
      phase,
      selectedId,
      selectedVault: vaults.find((item) => item.id === selectedId) || session.meta,
      error,
      busy,
      recoveryKey,
      unlocked: session.unlocked,
      meta: session.meta,
      data: session.data,
      selectVault,
      startCreate,
      startRecovery,
      backToList,
      handleCreate,
      confirmRecoverySaved,
      handleUnlock,
      handleRecoveryReset,
      lock,
      refreshVaults,
      updateMasterPassword,
      rotateRecoveryKey,
      exportEncryptedBackup,
      importEncryptedBackup: async (backup) => {
        const meta = await importEncryptedBackup(backup);
        await refreshVaults();
        return meta;
      },
      destroyActiveVault,
      wipeDevice: async () => {
        await wipeDevice();
        setPhase('create');
        await refreshVaults();
      },
      setError,
    }),
    [vaults, phase, selectedId, error, busy, recoveryKey, session]
  );

  return value;
};
