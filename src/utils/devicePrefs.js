const testersKey = 'fv_tester_tools';

const scoped = (id, name) => `fv_${name}_${id}`;

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
};

export const markBackupExported = (vaultId) => {
  if (vaultId) write(scoped(vaultId, 'backup'), new Date().toISOString());
};

export const getLastBackupAt = (vaultId) => (vaultId ? read(scoped(vaultId, 'backup')) : null);

export const backupAgeDays = (vaultId) => {
  const iso = getLastBackupAt(vaultId);
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86400000);
};

export const backupIsStale = (vaultId, staleAfter = 30) => {
  const age = backupAgeDays(vaultId);
  return age === null || age >= staleAfter;
};

export const isTesterTools = () => read(testersKey) === '1';

export const setTesterTools = (on) => write(testersKey, on ? '1' : '0');
