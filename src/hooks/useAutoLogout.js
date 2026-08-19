import { useEffect, useRef, useState } from 'react';

export const useAutoLogout = (onLogout, timeoutMinutes = 2, enabled = true) => {
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const [secondsLeft, setSecondsLeft] = useState(null);
  const onLogoutRef = useRef(onLogout);
  onLogoutRef.current = onLogout;

  useEffect(() => {
    document.documentElement.classList.remove('vault-obscured');
    if (!enabled) {
      setSecondsLeft(null);
      return undefined;
    }

    const timeoutMs = Math.max(1, timeoutMinutes) * 60 * 1000;

    const setObscured = (hidden) => {
      document.documentElement.classList.toggle('vault-obscured', hidden);
    };

    const clearTimers = () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (warningRef.current) window.clearInterval(warningRef.current);
      timeoutRef.current = null;
      warningRef.current = null;
    };

    const startCountdown = (from = 30) => {
      const start = Math.max(1, Math.ceil(from));
      setSecondsLeft(start);
      warningRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          const next = (prev ?? start) - 1;
          if (next <= 0) {
            window.clearInterval(warningRef.current);
            warningRef.current = null;
            onLogoutRef.current();
            return null;
          }
          return next;
        });
      }, 1000);
    };

    const scheduleFromElapsed = () => {
      clearTimers();
      setSecondsLeft(null);
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = timeoutMs - elapsed;
      if (remaining <= 0) {
        onLogoutRef.current();
        return;
      }
      if (remaining <= 30_000) {
        startCountdown(remaining / 1000);
        return;
      }
      timeoutRef.current = window.setTimeout(() => startCountdown(30), remaining - 30_000);
    };

    const arm = () => {
      lastActivityRef.current = Date.now();
      scheduleFromElapsed();
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'pointerdown', 'wheel'];
    events.forEach((event) => document.addEventListener(event, arm, { capture: true, passive: true }));
    window.addEventListener('wheel', arm, { capture: true, passive: true });

    const onHidden = () => {
      setObscured(document.hidden);
      scheduleFromElapsed();
    };
    document.addEventListener('visibilitychange', onHidden);

    const onPageShow = (event) => {
      if (event.persisted) onLogoutRef.current();
    };
    window.addEventListener('pageshow', onPageShow);

    setObscured(document.hidden);
    arm();

    return () => {
      events.forEach((event) => document.removeEventListener(event, arm, true));
      window.removeEventListener('wheel', arm, true);
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pageshow', onPageShow);
      document.documentElement.classList.remove('vault-obscured');
      clearTimers();
    };
  }, [enabled, timeoutMinutes]);

  return secondsLeft;
};
