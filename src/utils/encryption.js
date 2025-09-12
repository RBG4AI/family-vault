import CryptoJS from 'crypto-js';

const getEncryptionKey = () => {
  const profile = JSON.parse(sessionStorage.getItem('vault_profile') || '{}');
  const masterPassword = localStorage.getItem(`vault_data_${profile.id}`) ? 
    JSON.parse(localStorage.getItem(`vault_data_${profile.id}`)).masterPassword : '';
  return masterPassword + profile.id;
};

export const encrypt = (text) => {
  try {
    const key = getEncryptionKey();
    return CryptoJS.AES.encrypt(text, key).toString();
  } catch {
    return text;
  }
};

export const decrypt = (encryptedText) => {
  try {
    const key = getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return encryptedText;
  }
};

const sensitiveFields = ['password', 'pin', 'cvv', 'accountNumber', 'cardNumber', 'documentNumber'];

export const encryptSensitiveData = (data) => {
  const encrypted = { ...data };
  Object.keys(encrypted).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      encrypted[key] = encrypt(encrypted[key]);
    }
  });
  return encrypted;
};

export const decryptSensitiveData = (data) => {
  const decrypted = { ...data };
  Object.keys(decrypted).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      decrypted[key] = decrypt(decrypted[key]);
    }
  });
  return decrypted;
};