import { toB64, fromB64, wipe, formatRecoveryKey, parseRecoveryKey } from './encoding';

export const VAULT_CRYPTO_VERSION = 1;
export const KDF_ITERATIONS = 400000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const requireSecureContext = () => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('This app must run on localhost or HTTPS. Web Crypto is unavailable.');
  }
};

const deriveKek = async (secretBytes, salt, iterations) => {
  requireSecureContext();
  const material = await crypto.subtle.importKey('raw', secretBytes, 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

const deriveKekFromPassword = (password, salt, iterations) =>
  deriveKek(encoder.encode(password), salt, iterations);

const aesEncrypt = async (key, plainBytes) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plainBytes);
  return { iv: toB64(iv), data: toB64(data) };
};

const aesDecrypt = async (key, payload) => {
  const iv = fromB64(payload.iv);
  const data = fromB64(payload.data);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new Uint8Array(plain);
};

const encryptJson = async (dek, value) => {
  const bytes = encoder.encode(JSON.stringify(value));
  return aesEncrypt(dek, bytes);
};

const decryptJson = async (dek, payload) => {
  const bytes = await aesDecrypt(dek, payload);
  const json = decoder.decode(bytes);
  wipe(bytes);
  return JSON.parse(json);
};

const importDek = (raw, extractable = false) =>
  crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, extractable, ['encrypt', 'decrypt']);

export const EMPTY_VAULT_DATA = {
  version: 3,
  credentials: [],
  emails: [],
  banking: [],
  cards: [],
  government: [],
  insurance: [],
  investments: [],
  notes: [],
  people: [],
  vehicles: [],
  properties: [],
  vitals: [],
  settings: {
    autoLockMinutes: 2,
  },
};

export const hydrateVaultData = (raw = {}) => ({
  ...EMPTY_VAULT_DATA,
  ...raw,
  credentials: raw.credentials || [],
  emails: raw.emails || [],
  banking: raw.banking || [],
  cards: raw.cards || [],
  government: raw.government || [],
  insurance: raw.insurance || [],
  investments: raw.investments || [],
  notes: raw.notes || [],
  people: raw.people || [],
  vehicles: raw.vehicles || [],
  properties: raw.properties || [],
  vitals: raw.vitals || [],
  settings: { ...EMPTY_VAULT_DATA.settings, ...(raw.settings || {}) },
});

export const createEnvelope = async (password, initialData = EMPTY_VAULT_DATA) => {
  requireSecureContext();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const kek = await deriveKekFromPassword(password, salt, KDF_ITERATIONS);
  const dek = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const dekRaw = new Uint8Array(await crypto.subtle.exportKey('raw', dek));

  const wrappedDek = await aesEncrypt(kek, dekRaw);

  const recoveryKey = crypto.getRandomValues(new Uint8Array(32));
  const recoverySalt = crypto.getRandomValues(new Uint8Array(16));
  const recoveryKek = await deriveKek(recoveryKey, recoverySalt, KDF_ITERATIONS);
  const recoveryWrappedDek = await aesEncrypt(recoveryKek, dekRaw);

  const sessionDek = await importDek(dekRaw, false);
  wipe(dekRaw);

  const initial = structuredClone(initialData);
  const vault = await encryptJson(sessionDek, initial);

  return {
    envelope: {
      version: VAULT_CRYPTO_VERSION,
      kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: KDF_ITERATIONS, salt: toB64(salt) },
      wrappedDek,
      recovery: {
        kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: KDF_ITERATIONS, salt: toB64(recoverySalt) },
        wrappedDek: recoveryWrappedDek,
      },
      vault,
    },
    dek: sessionDek,
    recoveryKey: formatRecoveryKey(recoveryKey),
    data: initial,
  };
};

const unwrapDek = async (envelope, kek) => {
  const dekRaw = await aesDecrypt(kek, envelope.wrappedDek);
  const dek = await importDek(dekRaw, false);
  wipe(dekRaw);
  return dek;
};

export const unlockEnvelope = async (envelope, password) => {
  try {
    const salt = fromB64(envelope.kdf.salt);
    const kek = await deriveKekFromPassword(password, salt, envelope.kdf.iterations);
    const dek = await unwrapDek(envelope, kek);
    const data = await decryptJson(dek, envelope.vault);
    return { dek, data };
  } catch {
    throw new Error('Wrong master password.');
  }
};

export const unlockEnvelopeWithRecovery = async (envelope, recoveryKeyText) => {
  if (!envelope.recovery) {
    throw new Error('This vault has no recovery key.');
  }
  try {
    const recoveryKey = parseRecoveryKey(recoveryKeyText);
    const salt = fromB64(envelope.recovery.kdf.salt);
    const kek = await deriveKek(recoveryKey, salt, envelope.recovery.kdf.iterations);
    wipe(recoveryKey);
    const dekRaw = await aesDecrypt(kek, envelope.recovery.wrappedDek);
    const dek = await importDek(dekRaw, false);
    wipe(dekRaw);
    const data = await decryptJson(dek, envelope.vault);
    return { dek, data };
  } catch (error) {
    if (error.message?.includes('Recovery key')) throw error;
    throw new Error('Invalid recovery key.');
  }
};

export const persistEnvelope = async (envelope, dek, data) => ({
  ...envelope,
  vault: await encryptJson(dek, data),
});

export const changePassword = async (envelope, currentPassword, nextPassword) => {
  const oldKek = await deriveKekFromPassword(
    currentPassword,
    fromB64(envelope.kdf.salt),
    envelope.kdf.iterations
  );
  let dekRaw;
  try {
    dekRaw = await aesDecrypt(oldKek, envelope.wrappedDek);
  } catch {
    throw new Error('Current password is incorrect.');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const kek = await deriveKekFromPassword(nextPassword, salt, KDF_ITERATIONS);
  const wrappedDek = await aesEncrypt(kek, dekRaw);
  wipe(dekRaw);

  return {
    ...envelope,
    kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: KDF_ITERATIONS, salt: toB64(salt) },
    wrappedDek,
  };
};

export const resetPasswordWithRecovery = async (envelope, recoveryKeyText, nextPassword) => {
  const { dek, data } = await unlockEnvelopeWithRecovery(envelope, recoveryKeyText);
  const recoveryKey = parseRecoveryKey(recoveryKeyText);
  const recoveryKek = await deriveKek(
    recoveryKey,
    fromB64(envelope.recovery.kdf.salt),
    envelope.recovery.kdf.iterations
  );
  const dekRaw = await aesDecrypt(recoveryKek, envelope.recovery.wrappedDek);
  wipe(recoveryKey);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const kek = await deriveKekFromPassword(nextPassword, salt, KDF_ITERATIONS);
  const wrappedDek = await aesEncrypt(kek, dekRaw);
  wipe(dekRaw);

  return {
    envelope: {
      ...envelope,
      kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: KDF_ITERATIONS, salt: toB64(salt) },
      wrappedDek,
    },
    dek,
    data,
  };
};

export const regenerateRecovery = async (envelope, password) => {
  const { dek, data } = await unlockEnvelope(envelope, password);
  const dekRaw = await aesDecrypt(
    await deriveKekFromPassword(password, fromB64(envelope.kdf.salt), envelope.kdf.iterations),
    envelope.wrappedDek
  );

  const recoveryKey = crypto.getRandomValues(new Uint8Array(32));
  const recoverySalt = crypto.getRandomValues(new Uint8Array(16));
  const recoveryKek = await deriveKek(recoveryKey, recoverySalt, KDF_ITERATIONS);
  const recoveryWrappedDek = await aesEncrypt(recoveryKek, dekRaw);
  wipe(dekRaw);

  return {
    envelope: {
      ...envelope,
      recovery: {
        kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: KDF_ITERATIONS, salt: toB64(recoverySalt) },
        wrappedDek: recoveryWrappedDek,
      },
    },
    dek,
    data,
    recoveryKey: formatRecoveryKey(recoveryKey),
  };
};

export const passwordScore = (password) => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 10) score += 1;
  if (password.length >= 14) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 5);
};
