const mapsHost = (hostname) => {
  const host = String(hostname || '').toLowerCase().replace(/^www\./, '');
  if (host === 'maps.app.goo.gl' || host === 'goo.gl') return true;
  if (host === 'google.com' || host.endsWith('.google.com')) return true;
  if (host === 'google.co.in' || host.endsWith('.google.co.in')) return true;
  return false;
};

const mapsPathOk = (url) => {
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'maps.app.goo.gl' || host === 'goo.gl') return true;
  if (host.startsWith('maps.google.')) return true;
  return url.pathname.includes('/maps') || url.searchParams.has('q') || url.searchParams.has('query');
};

const toHref = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
      if (!mapsHost(url.hostname) || !mapsPathOk(url)) return '';
      return url.href;
    } catch {
      return '';
    }
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(raw)}`;
};

export const mapsHref = (location, fallbackAddress) => toHref(location) || toHref(fallbackAddress);

export const mapsLabel = (location, fallbackAddress) => {
  const raw = String(location || '').trim();
  if (raw && !/^https?:\/\//i.test(raw)) return raw;
  const address = String(fallbackAddress || '').trim();
  return address || '';
};
