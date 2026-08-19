const COPY_CLEAR_MS = 30_000;

export const copySecret = async (text) => {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    return false;
  }

  window.setTimeout(async () => {
    try {
      const current = await navigator.clipboard.readText();
      if (current === text) {
        await navigator.clipboard.writeText('');
      }
    } catch {
      // Browser blocked clipboard read; leave contents as-is.
    }
  }, COPY_CLEAR_MS);

  return true;
};
