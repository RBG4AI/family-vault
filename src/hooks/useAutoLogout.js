import { useEffect, useRef, useState } from 'react';

export const useAutoLogout = (onLogout, timeoutMinutes = 2, enabled = true) => {
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const onLogoutRef = useRef(onLogout);
  onLogoutRef.current = onLogout;

  useEffect(() => {
    if (!enabled) {
      setSecondsLeft(null);
      return undefined;
    }

    const clearTimers = () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (warningRef.current) window.clearInterval(warningRef.current);
    };

    const arm = () => {
      clearTimers();
      setSecondsLeft(null);
      const timeoutMs = Math.max(1, timeoutMinutes) * 60 * 1000;
      const warnAt = timeoutMs - 30_000;

      timeoutRef.current = window.setTimeout(() => {
        warningRef.current = window.setInterval(() => {
          setSecondsLeft((prev) => {
            const next = (prev ?? 30) - 1;
            if (next <= 0) {
              window.clearInterval(warningRef.current);
              onLogoutRef.current();
              return null;
            }
            return next;
          });
        }, 1000);
        setSecondsLeft(30);
      }, Math.max(0, warnAt));
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'pointerdown'];
    events.forEach((event) => document.addEventListener(event, arm, true));

    const onHidden = () => {
      if (document.hidden) {
        clearTimers();
        setSecondsLeft(null);
        timeoutRef.current = window.setTimeout(() => onLogoutRef.current(), 30_000);
      } else {
        arm();
      }
    };
    document.addEventListener('visibilitychange', onHidden);

    arm();

    return () => {
      events.forEach((event) => document.removeEventListener(event, arm, true));
      document.removeEventListener('visibilitychange', onHidden);
      clearTimers();
    };
  }, [enabled, timeoutMinutes]);

  return secondsLeft;
};
