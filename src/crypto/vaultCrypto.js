import { toB64, fromB64, wipe, formatRecoveryKey, parseRecoveryKey } from './encoding';

export const VAULT_CRYPTO_VERSION = 2;
export const KDF_ITERATIONS = 400000;
export const KDF_ITERATIONS_MAX = 800000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const requireSecureContext = () => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('This app must run on localhost or HTTPS. Web Crypto is unavailable.');
  }
};

const cryptoError = (code, message) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

export const assertSafeKdf = (kdf) => {
  if (!kdf || kdf.name !== 'PBKDF2' || kdf.hash !== 'SHA-256') {
    throw cryptoError('invalid_kdf', 'Vault key-derivation parameters are not supported.');
  }
  const iterations = Number(kdf.iterations);
  if (!Number.isInteger(iterations) || iterations < KDF_ITERATIONS || iterations > KDF_ITERATIONS_MAX) {
    throw cryptoError('invalid_kdf', 'Vault key-derivation parameters are not supported.');
  }
  if (!kdf.salt || typeof kdf.salt !== 'string') {
    throw cryptoError('invalid_kdf', 'Vault key-derivation parameters are not supported.');
  }
};

export const assertEnvelopeShape = (envelope) => {
  if (!envelope || typeof envelope !== 'object') {
    throw cryptoError('invalid_backup', 'Not a valid Vault backup file.');
  }
  assertSafeKdf(envelope.kdf);
  if (envelope.recovery) assertSafeKdf(envelope.recovery.kdf);
  if (!envelope.wrappedDek?.iv || !envelope.wrappedDek?.data || !envelope.vault?.iv || !envelope.vault?.data) {
    throw cryptoError('invalid_backup', 'Not a valid Vault backup file.');
  }
};

const envelopeAad = (envelope) =>
  encoder.encode(
    JSON.stringify({
      v: envelope.version || 1,
      kdf: envelope.kdf,
      recovery: envelope.recovery?.kdf || null,
    })
  );

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

const aesEncrypt = async (key, plainBytes, aad) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const params = { name: 'AES-GCM', iv };
  if (aad) params.additionalData = aad;
  const data = await crypto.subtle.encrypt(params, key, plainBytes);
  return { iv: toB64(iv), data: toB64(data) };
};

const aesDecrypt = async (key, payload, aad) => {
  const iv = fromB64(payload.iv);
  const data = fromB64(payload.data);
  const params = { name: 'AES-GCM', iv };
  if (aad) params.additionalData = aad;
  const plain = await crypto.subtle.decrypt(params, key, data);
  return new Uint8Array(plain);
};

const encryptJson = async (dek, value, aad) => {
  const bytes = encoder.encode(JSON.stringify(value));
  const payload = await aesEncrypt(dek, bytes, aad);
  wipe(bytes);
  return payload;
};

const decryptJson = async (dek, payload, aad) => {
  const bytes = await aesDecrypt(dek, payload, aad);
  const json = decoder.decode(bytes);
  wipe(bytes);
  return JSON.parse(json);
};

const importDek = (raw, extractable = false) =>
  crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, extractable, ['encrypt', 'decrypt']);

const asList = (value) => (Array.isArray(value) ? value : []);

const safeLockMinutes = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 60) return 2;
  return n;
};

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
  version: 3,
  credentials: asList(raw.credentials),
  emails: asList(raw.emails),
  banking: asList(raw.banking),
  cards: asList(raw.cards),
  government: asList(raw.government),
  insurance: asList(raw.insurance),
  investments: asList(raw.investments),
  notes: asList(raw.notes),
  people: asList(raw.people),
  vehicles: asList(raw.vehicles),
  properties: asList(raw.properties),
  vitals: asList(raw.vitals),
  settings: {
    autoLockMinutes: safeLockMinutes(raw.settings?.autoLockMinutes),
  },
});

export const createEnvelope = async (password, initialData = EMPTY_VAULT_DATA) => {
  requireSecureContext();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const kek = await deriveKekFromPassword(password, salt, KDF_ITERATIONS);
  const dek = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const dekRaw = new Uint8Array(await crypto.subtle.exportKey('raw', dek));

  const kdf = { name: 'PBKDF2', hash: 'SHA-256', iterations: KDF_ITERATIONS, salt: toB64(salt) };
  const recoveryKey = crypto.getRandomValues(new Uint8Array(32));
  const recoverySalt = crypto.getRandomValues(new Uint8Array(16));
  const recoveryKdf = { name: 'PBKDF2', hash: 'SHA-256', iterations: KDF_ITERATIONS, salt: toB64(recoverySalt) };
  const draft = {
    version: VAULT_CRYPTO_VERSION,
    kdf,
    recovery: { kdf: recoveryKdf },
  };
  const aad = envelopeAad(draft);

  const wrappedDek = await aesEncrypt(kek, dekRaw, aad);
  const recoveryKek = await deriveKek(recoveryKey, recoverySalt, KDF_ITERATIONS);
  const recoveryWrappedDek = await aesEncrypt(recoveryKek, dekRaw, aad);

  const sessionDek = await importDek(dekRaw, false);
  wipe(dekRaw);

  const initial = hydrateVaultData(initialData);
  const vault = await encryptJson(sessionDek, initial, aad);

  return {
    envelope: {
      ...draft,
      wrappedDek,
      recovery: {
        kdf: recoveryKdf,
        wrappedDek: recoveryWrappedDek,
      },
      vault,
    },
    dek: sessionDek,
    recoveryKey: formatRecoveryKey(recoveryKey),
    data: initial,
  };
};

const payloadAad = (envelope) => (envelope.version >= 2 ? envelopeAad(envelope) : undefined);

const unwrapDek = async (envelope, kek) => {
  const dekRaw = await aesDecrypt(kek, envelope.wrappedDek, payloadAad(envelope));
  const dek = await importDek(dekRaw, false);
  wipe(dekRaw);
  return dek;
};

const decryptVault = async (envelope, dek) => decryptJson(dek, envelope.vault, payloadAad(envelope));

export const unlockEnvelope = async (envelope, password) => {
  assertEnvelopeShape(envelope);
  try {
    const salt = fromB64(envelope.kdf.salt);
    const kek = await deriveKekFromPassword(password, salt, envelope.kdf.iterations);
    const dek = await unwrapDek(envelope, kek);
    const data = await decryptVault(envelope, dek);
    return { dek, data };
  } catch (error) {
    if (error.code === 'invalid_kdf' || error.code === 'invalid_backup') throw error;
    throw new Error('Wrong master password.');
  }
};

export const unlockEnvelopeWithRecovery = async (envelope, recoveryKeyText) => {
  assertEnvelopeShape(envelope);
  if (!envelope.recovery) {
    throw new Error('This vault has no recovery key.');
  }
  try {
    const recoveryKey = parseRecoveryKey(recoveryKeyText);
    const salt = fromB64(envelope.recovery.kdf.salt);
    const kek = await deriveKek(recoveryKey, salt, envelope.recovery.kdf.iterations);
    wipe(recoveryKey);
    const dekRaw = await aesDecrypt(kek, envelope.recovery.wrappedDek, payloadAad(envelope));
    const dek = await importDek(dekRaw, false);
    wipe(dekRaw);
    const data = await decryptVault(envelope, dek);
    return { dek, data };
  } catch (error) {
    if (error.message?.includes('Recovery key') || error.code === 'invalid_kdf') throw error;
    throw new Error('Invalid recovery key.');
  }
};

export const persistEnvelope = async (envelope, dek, data) => ({
  ...envelope,
  vault: await encryptJson(dek, data, payloadAad(envelope)),
});

export const changePassword = async (envelope, currentPassword, nextPassword, data) => {
  assertEnvelopeShape(envelope);
  await unlockEnvelope(envelope, currentPassword);
  return createEnvelope(nextPassword, data);
};

export const resetPasswordWithRecovery = async (envelope, recoveryKeyText, nextPassword) => {
  const unlocked = await unlockEnvelopeWithRecovery(envelope, recoveryKeyText);
  return createEnvelope(nextPassword, unlocked.data);
};

export const regenerateRecovery = async (envelope, password) => {
  const { dek, data } = await unlockEnvelope(envelope, password);
  const kek = await deriveKekFromPassword(password, fromB64(envelope.kdf.salt), envelope.kdf.iterations);
  const dekRaw = await aesDecrypt(kek, envelope.wrappedDek, payloadAad(envelope));

  const recoveryKey = crypto.getRandomValues(new Uint8Array(32));
  const recoverySalt = crypto.getRandomValues(new Uint8Array(16));
  const recoveryKek = await deriveKek(recoveryKey, recoverySalt, KDF_ITERATIONS);
  const recoveryKdf = { name: 'PBKDF2', hash: 'SHA-256', iterations: KDF_ITERATIONS, salt: toB64(recoverySalt) };
  const next = {
    ...envelope,
    recovery: { kdf: recoveryKdf },
  };
  const nextAad = payloadAad(next);
  const wrappedDek = await aesEncrypt(kek, dekRaw, nextAad);
  const recoveryWrappedDek = await aesEncrypt(recoveryKek, dekRaw, nextAad);
  const vault = await encryptJson(dek, data, nextAad);
  wipe(dekRaw);

  return {
    envelope: {
      ...next,
      wrappedDek,
      recovery: {
        kdf: recoveryKdf,
        wrappedDek: recoveryWrappedDek,
      },
      vault,
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
