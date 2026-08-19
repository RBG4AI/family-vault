export const vaultErrorText = (err, t) => {
  if (!err) return '';
  switch (err.code) {
    case 'wrong_password':
      return err.remaining > 0 ? t('unlock.wrong', { remaining: err.remaining }) : t('unlock.wrongNone');
    case 'locked':
      return t('unlock.locked', { seconds: err.seconds });
    case 'not_found':
      return t('unlock.notFound');
    case 'wrong_master':
      return t('unlock.wrongMaster');
    case 'storage':
      return t('list.storageFailed');
    case 'create_failed':
      return t('create.failed');
    case 'recovery_failed':
      return t('recovery.failed');
    case 'invalid_backup':
      return t('list.invalidBackup');
    case 'invalid_kdf':
      return t('unlock.invalidKdf');
    case 'name_mismatch':
      return t('settings.nameMismatch');
    case 'locked_vault':
      return t('unlock.vaultLocked');
    case 'save_failed':
      return t('common.saveFailed');
    default:
      return err.message || t('unlock.failed');
  }
};

export const taggedError = (code, fallback, extra = {}) => {
  const err = new Error(fallback);
  err.code = code;
  Object.assign(err, extra);
  return err;
};
