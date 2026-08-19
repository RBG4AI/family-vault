import { storage } from './storage';

const SECRET_KEYS = new Set([
  'password',
  'cvv',
  'pin',
  'netBankingPassword',
  'transactionPin',
  'mobilePin',
  'content',
  'twoFactorCodes',
]);

const BUCKETS = [
  'people',
  'credentials',
  'emails',
  'banking',
  'cards',
  'government',
  'insurance',
  'investments',
  'vehicles',
  'properties',
  'notes',
  'vitals',
];

const titleFor = (item, bucket) =>
  item.name ||
  item.appName ||
  item.emailAddress ||
  item.bankName ||
  item.documentType ||
  item.insuranceType ||
  item.cardType ||
  item.title ||
  item.registrationNumber ||
  item.policyNumber ||
  (bucket === 'vitals' ? item.date : '') ||
  '';

const searchable = (item) =>
  Object.entries(item)
    .filter(([key]) => !SECRET_KEYS.has(key) && key !== 'id')
    .map(([, value]) => value)
    .filter((value) => value !== undefined && value !== null && value !== '')
    .join(' ')
    .toLowerCase();

export const searchVault = (query, limit = 12) => {
  const q = String(query || '').trim().toLowerCase();
  if (q.length < 2) return [];
  const hits = [];
  BUCKETS.forEach((bucket) => {
    (storage.get(bucket) || []).forEach((item) => {
      if (!searchable(item).includes(q)) return;
      hits.push({
        id: `${bucket}-${item.id}`,
        section: bucket,
        title: titleFor(item, bucket) || bucket,
        itemId: item.id,
      });
    });
  });
  return hits.slice(0, limit);
};
