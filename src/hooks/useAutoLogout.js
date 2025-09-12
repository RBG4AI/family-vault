import { useEffect, useRef } from 'react';

export const useAutoLogout = (onLogout, timeoutMinutes = 2) => {
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    
    // Warning at 1.5 minutes
    warningRef.current = setTimeout(() => {
      const shouldContinue = confirm('Session will expire in 30 seconds. Continue?');
      if (!shouldContinue) {
        onLogout();
      }
    }, (timeoutMinutes - 0.5) * 60 * 1000);
    
    // Auto logout at 2 minutes
    timeoutRef.current = setTimeout(() => {
      onLogout();
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimer = () => resetTimeout();
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });
    
    resetTimeout();
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [onLogout, timeoutMinutes]);
};