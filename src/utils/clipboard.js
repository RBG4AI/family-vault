const COPY_CLEAR_MS = 30_000;

let wipeToken = 0;

export const copyText = async (text) => {
  if (!text) return false;
  wipeToken += 1;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const copySecret = async (text) => {
  const ok = await copyText(text);
  if (!ok) return false;

  const token = wipeToken;
  window.setTimeout(async () => {
    if (token !== wipeToken) return;
    try {
      await navigator.clipboard.writeText('');
    } catch {
      /* Clipboard write blocked. */
    }
  }, COPY_CLEAR_MS);

  return true;
};
