const COPY_CLEAR_MS = 30_000;

export const copyText = async (text) => {
  if (!text) return false;
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

  window.setTimeout(async () => {
    try {
      if (navigator.clipboard.readText) {
        const current = await navigator.clipboard.readText();
        if (current === text) await navigator.clipboard.writeText('\u00a0');
      }
    } catch {
      /* Browser blocked clipboard read. */
    }
  }, COPY_CLEAR_MS);

  return true;
};
