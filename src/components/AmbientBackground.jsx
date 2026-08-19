import React from 'react';

const AmbientBackground = ({ children, className = '' }) => (
  <div className={`relative min-h-dvh overflow-x-hidden print:overflow-visible ${className}`}>
    <div className="pointer-events-none absolute inset-0 vault-mesh print-hide" />
    <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-500/20 blur-3xl hidden md:block print-hide" />
    <div className="pointer-events-none absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-cyan-400/10 blur-3xl hidden md:block print-hide" />
    <div className="relative z-10 min-h-dvh print:min-h-0">{children}</div>
  </div>
);

export default AmbientBackground;
