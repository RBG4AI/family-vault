export const printSection = (id) => {
  document.documentElement.setAttribute('data-print', id);
  const cleanup = () => {
    document.documentElement.removeAttribute('data-print');
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  window.setTimeout(() => window.print(), 50);
};

export const appUrl = () => {
  const path = window.location.pathname.replace(/index\.html$/i, '').replace(/\/?$/, '/');
  return `${window.location.origin}${path}`;
};
