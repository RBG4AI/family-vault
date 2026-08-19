const toB64 = (buffer) => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

const fromB64 = (value) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const wipe = (bytes) => {
  if (bytes && bytes.fill) bytes.fill(0);
};

const formatRecoveryKey = (bytes) => {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return hex.match(/.{1,4}/g).join('-').toUpperCase();
};

const parseRecoveryKey = (value) => {
  const hex = String(value || '').replace(/[^0-9a-fA-F]/g, '');
  if (hex.length !== 64) {
    throw new Error('Recovery key must be 32 bytes (64 hex characters).');
  }
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

export { toB64, fromB64, wipe, formatRecoveryKey, parseRecoveryKey };
