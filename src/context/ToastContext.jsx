import React, { createContext, useContext, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toastState, setToastState] = useState(null);
  const timerRef = useRef(0);

  const toast = (text, options = {}) => {
    window.clearTimeout(timerRef.current);
    setToastState({
      message: text,
      undo: options.undo,
      undoLabel: options.undoLabel || 'Undo',
    });
    timerRef.current = window.setTimeout(() => setToastState(null), options.undo ? 7000 : 2800);
  };

  const runUndo = () => {
    window.clearTimeout(timerRef.current);
    toastState?.undo?.();
    setToastState(null);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <AnimatePresence>
        {toastState?.message && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-full bg-white text-dark-900 text-sm font-medium flex items-center gap-3 max-w-[90vw]"
          >
            <span>{toastState.message}</span>
            {toastState.undo && (
              <button type="button" onClick={runUndo} className="font-semibold text-cyan-800">
                {toastState.undoLabel}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext) || { toast: () => {} };
