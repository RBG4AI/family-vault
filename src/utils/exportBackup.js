import { markBackupExported } from './devicePrefs';

export const downloadVaultBackup = async (vault) => {
  const backup = await vault.exportEncryptedBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = String(vault.meta?.name || 'vault')
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'vault';
  link.href = url;
  link.download = `${safeName}-backup.vault.json`;
  link.click();
  URL.revokeObjectURL(url);
  markBackupExported(vault.meta?.id);
};
