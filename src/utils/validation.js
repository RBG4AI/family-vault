const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
const AADHAAR_RE = /^\d{12}$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/i;

export const validateField = (key, value, context = {}) => {
  const text = String(value || '').trim();
  if (!text) return '';

  if (key === 'ifscCode' && !IFSC_RE.test(text)) {
    return 'validation.ifsc';
  }

  if (key === 'documentNumber') {
    const type = context.documentType || '';
    if (type.includes('PAN') && !PAN_RE.test(text.replace(/\s/g, ''))) {
      return 'validation.pan';
    }
    if (type.includes('Aadhaar') && !AADHAAR_RE.test(text.replace(/\s/g, ''))) {
      return 'validation.aadhaar';
    }
  }

  return '';
};
