const LEGACY_PROFILE_KEY = 'vault_profiles';
const SENSITIVE_KEYS = [
  'vault_data',
  'masterPassword',
  'credentials',
  'emails',
  'banking',
  'cards',
  'government',
  'insurance',
  'investments',
  'emergency_code',
  'biometric_enabled',
  'biometric_credential',
  'vault_cached_app',
  'vault_cached_page',
  'vault_cache_time',
  'last_sync',
];

const parseJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const findLegacyVaults = () => {
  const profiles = parseJson(localStorage.getItem(LEGACY_PROFILE_KEY), []);
  const vaults = [];

  profiles.forEach((profile) => {
    const packed = parseJson(localStorage.getItem(`vault_data_${profile.id}`), null);
    if (packed) {
      vaults.push({
        id: `legacy-${profile.id}`,
        legacyId: profile.id,
        name: `${profile.name || 'Untitled'} (legacy)`,
        kind: 'personal',
        createdAt: profile.createdAt || new Date().toISOString(),
        updatedAt: packed.updatedAt || profile.createdAt || new Date().toISOString(),
        isLegacy: true,
        packed,
      });
    }
  });

  const unscoped = parseJson(localStorage.getItem('vault_data'), null);
  if (unscoped && !vaults.length) {
    vaults.push({
      id: 'legacy-default',
      legacyId: 'default',
      name: 'Legacy vault',
      kind: 'personal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isLegacy: true,
      packed: unscoped,
    });
  }

  return vaults;
};

export const verifyLegacyPassword = (legacyVault, password) => {
  const stored = legacyVault.packed?.masterPassword;
  if (!stored) return true;
  return stored === password;
};

export const extractLegacyData = (legacyVault) => {
  const packed = legacyVault.packed || {};
  const categories = ['credentials', 'emails', 'banking', 'cards', 'government', 'insurance', 'investments'];
  const data = {
    version: 2,
    notes: packed.notes || [],
    settings: { autoLockMinutes: 2 },
  };

  categories.forEach((key) => {
    data[key] = Array.isArray(packed[key])
      ? packed[key]
      : parseJson(localStorage.getItem(key), []);
  });

  return data;
};

export const wipeLegacyVault = (legacyVault) => {
  if (legacyVault.legacyId && legacyVault.legacyId !== 'default') {
    localStorage.removeItem(`vault_data_${legacyVault.legacyId}`);
    const profiles = parseJson(localStorage.getItem(LEGACY_PROFILE_KEY), []);
    localStorage.setItem(
      LEGACY_PROFILE_KEY,
      JSON.stringify(profiles.filter((p) => p.id !== legacyVault.legacyId))
    );
  }
  localStorage.removeItem('vault_data');
};

export const wipeAllLegacySecrets = () => {
  SENSITIVE_KEYS.forEach((key) => localStorage.removeItem(key));
  Object.keys(localStorage).forEach((key) => {
    if (
      key.startsWith('vault_data') ||
      key.startsWith('sync_') ||
      key === 'vault_profiles' ||
      key === 'vault_session' ||
      key === 'vault_profile'
    ) {
      localStorage.removeItem(key);
    }
  });
  sessionStorage.removeItem('vault_session');
  sessionStorage.removeItem('vault_profile');
};
