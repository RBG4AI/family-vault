import { storage } from './storage';

const digits = (value) => String(value || '').replace(/\s/g, '');

export const duplicateDocumentError = (formData, editId) => {
  const type = formData.documentType || '';
  const kind = type.includes('PAN') ? 'PAN' : type.includes('Aadhaar') ? 'Aadhaar' : '';
  if (!kind) return '';
  const needle = digits(formData.documentNumber);
  if (!needle) return '';
  const hit = (storage.get('government') || []).find(
    (item) =>
      item.id !== editId &&
      String(item.documentType || '').includes(kind) &&
      digits(item.documentNumber) === needle
  );
  return hit ? 'validation.duplicateId' : '';
};
