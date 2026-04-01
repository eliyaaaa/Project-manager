import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);
const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, options = {}) => {
    const id = genId();
    const duration = options.duration ?? 3000;
    const type = options.type ?? 'default'; // 'default' | 'success'
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400);
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
