import {
  EMPTY_VAULT_DATA,
  changePassword,
  createEnvelope,
  hydrateVaultData,
  persistEnvelope,
  regenerateRecovery,
  resetPasswordWithRecovery,
  unlockEnvelope,
} from '../crypto/vaultCrypto';
import { deleteVaultRecord, getVaultRecord, listVaultRecords, saveVaultRecord } from './db.js';
import { extractLegacyData, findLegacyVaults, verifyLegacyPassword, wipeAllLegacySecrets, wipeLegacyVault } from './legacy';
import { taggedError } from '../i18n/vaultErrors';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

let dek = null;
let envelope = null;
let data = structuredClone(EMPTY_VAULT_DATA);
let activeMeta = null;
let persistChain = Promise.resolve();
let persistError = null;

const listeners = new Set();

export const subscribeVault = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notify = () => {
  listeners.forEach((listener) => listener());
};

const assertUnlocked = () => {
  if (!dek || !envelope || !activeMeta) {
    throw taggedError('locked_vault', 'Vault is locked.');
  }
};

const queuePersist = (task) => {
  persistChain = persistChain
    .catch(() => {})
    .then(task)
    .catch((error) => {
      persistError = error.code || 'save_failed';
      notify();
    });
  return persistChain;
};

export const getSessionSnapshot = () => ({
  dek,
  data,
  meta: activeMeta,
  unlocked: Boolean(dek),
  persistError,
});

export const listAllVaults = async () => {
  const records = await listVaultRecords();
  const legacy = findLegacyVaults().map(({ packed, ...meta }) => meta);
  return [...records, ...legacy];
};

const persistCurrent = () =>
  queuePersist(async () => {
    assertUnlocked();
    envelope = await persistEnvelope(envelope, dek, data);
    activeMeta = { ...activeMeta, updatedAt: new Date().toISOString(), failedAttempts: 0, lockedUntil: null };
    await saveVaultRecord({
      ...activeMeta,
      envelope,
    });
    persistError = null;
    notify();
  });

export const createVault = async ({ name, kind, password }) => {
  const created = await createEnvelope(password, EMPTY_VAULT_DATA);
  const meta = {
    id: crypto.randomUUID(),
    name: name.trim(),
    kind: kind || 'personal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    failedAttempts: 0,
    lockedUntil: null,
  };
  await saveVaultRecord({ ...meta, envelope: created.envelope });
  dek = created.dek;
  envelope = created.envelope;
  data = hydrateVaultData(created.data);
  activeMeta = meta;
  notify();
  return { meta, recoveryKey: created.recoveryKey };
};

const checkLockout = (record) => {
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    const seconds = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    throw taggedError('locked', `Too many attempts. Try again in ${seconds}s.`, { seconds });
  }
};

const registerFailure = async (record) => {
  const failedAttempts = (record.failedAttempts || 0) + 1;
  const lockedUntil = failedAttempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : null;
  const next = {
    ...record,
    failedAttempts: lockedUntil ? 0 : failedAttempts,
    lockedUntil,
  };
  if (!record.isLegacy) {
    await saveVaultRecord(next);
  }
  const remaining = MAX_ATTEMPTS - failedAttempts;
  if (lockedUntil) {
    throw taggedError('locked', 'Too many attempts. Vault locked for 30 seconds.', { seconds: 30 });
  }
  throw taggedError('wrong_password', remaining > 0 ? `Wrong password. ${remaining} attempts left.` : 'Wrong password.', { remaining });
};

export const unlockVault = async (id, password) => {
  const legacyMatch = findLegacyVaults().find((item) => item.id === id);
  if (legacyMatch) {
    if (!verifyLegacyPassword(legacyMatch, password)) {
      throw taggedError('wrong_master', 'Wrong master password.');
    }
    const migratedData = extractLegacyData(legacyMatch);
    const created = await createEnvelope(password, migratedData);
    const meta = {
      id: crypto.randomUUID(),
      name: (legacyMatch.name || 'Family vault').replace(' (legacy)', ''),
      kind: 'personal',
      createdAt: legacyMatch.createdAt,
      updatedAt: new Date().toISOString(),
      failedAttempts: 0,
      lockedUntil: null,
    };
    await saveVaultRecord({ ...meta, envelope: created.envelope });
    wipeLegacyVault(legacyMatch);
    dek = created.dek;
    envelope = created.envelope;
    data = hydrateVaultData(created.data);
    activeMeta = meta;
    notify();
    return { migrated: true, recoveryKey: created.recoveryKey, id: meta.id };
  }

  const record = await getVaultRecord(id);
  if (!record) throw taggedError('not_found', 'Vault not found.');
  checkLockout(record);

  try {
    const unlocked = await unlockEnvelope(record.envelope, password);
    dek = unlocked.dek;
    envelope = record.envelope;
    data = hydrateVaultData(unlocked.data);
    activeMeta = {
      id: record.id,
      name: record.name,
      kind: record.kind,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      failedAttempts: 0,
      lockedUntil: null,
    };
    await saveVaultRecord({ ...record, failedAttempts: 0, lockedUntil: null });
    notify();
    return { migrated: false };
  } catch (error) {
    await registerFailure(record);
    throw error;
  }
};

export const unlockWithRecovery = async (id, recoveryKey, nextPassword) => {
  const record = await getVaultRecord(id);
  if (!record) throw taggedError('not_found', 'Vault not found.');
  const reset = await resetPasswordWithRecovery(record.envelope, recoveryKey, nextPassword);
  dek = reset.dek;
  envelope = reset.envelope;
  data = hydrateVaultData(reset.data);
  activeMeta = {
    id: record.id,
    name: record.name,
    kind: record.kind,
    createdAt: record.createdAt,
    updatedAt: new Date().toISOString(),
    failedAttempts: 0,
    lockedUntil: null,
  };
  await saveVaultRecord({ ...record, ...activeMeta, envelope });
  notify();
};

export const lockVault = async ({ persist = true } = {}) => {
  try {
    if (persist && dek) await persistChain;
  } catch {
    /* Still wipe keys from memory. */
  }
  dek = null;
  envelope = null;
  data = structuredClone(EMPTY_VAULT_DATA);
  activeMeta = null;
  persistError = null;
  notify();
};

export const getVaultData = () => (dek ? data : null);

export const updateVaultData = (updater) => {
  assertUnlocked();
  data = updater(data);
  notify();
  persistCurrent();
};

export const updateMasterPassword = async (currentPassword, nextPassword) => {
  assertUnlocked();
  envelope = await changePassword(envelope, currentPassword, nextPassword);
  await saveVaultRecord({ ...activeMeta, envelope, updatedAt: new Date().toISOString() });
};

export const rotateRecoveryKey = async (password) => {
  assertUnlocked();
  const rotated = await regenerateRecovery(envelope, password);
  envelope = rotated.envelope;
  await saveVaultRecord({ ...activeMeta, envelope, updatedAt: new Date().toISOString() });
  return rotated.recoveryKey;
};

export const exportEncryptedBackup = async () => {
  assertUnlocked();
  await persistCurrent();
  const record = await getVaultRecord(activeMeta.id);
  return {
    app: 'family-vault',
    format: 1,
    exportedAt: new Date().toISOString(),
    vault: {
      id: record.id,
      name: record.name,
      kind: record.kind,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      envelope: record.envelope,
    },
  };
};

export const importEncryptedBackup = async (backup) => {
  if (backup?.app !== 'family-vault' || !backup?.vault?.envelope) {
    throw taggedError('invalid_backup', 'Not a valid Vault backup file.');
  }
  const source = backup.vault;
  const existing = await listVaultRecords();
  const names = new Set(existing.map((item) => item.name));
  const root = (source.name || 'Imported vault').trim() || 'Imported vault';
  let name = root;
  if (names.has(name)) {
    name = `${root} (imported)`;
    let n = 2;
    while (names.has(name)) {
      name = `${root} (imported ${n})`;
      n += 1;
    }
  }
  const meta = {
    id: crypto.randomUUID(),
    name,
    kind: source.kind || 'personal',
    createdAt: source.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    failedAttempts: 0,
    lockedUntil: null,
  };
  await saveVaultRecord({ ...meta, envelope: source.envelope });
  return meta;
};

export const destroyActiveVault = async (confirmName) => {
  assertUnlocked();
  if (confirmName.trim() !== activeMeta.name) {
    throw taggedError('name_mismatch', 'Vault name does not match.');
  }
  const id = activeMeta.id;
  await deleteVaultRecord(id);
  await lockVault({ persist: false });
};

export const wipeDevice = async () => {
  const records = await listVaultRecords();
  await Promise.all(records.map((record) => deleteVaultRecord(record.id)));
  wipeAllLegacySecrets();
  await lockVault({ persist: false });
};

export { EMPTY_VAULT_DATA };
