import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICON_COLORS = {
  success: '#7fd09a',
  error: '#ff8a9f',
  info: '#e0b3d2'
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    timers.current.set(id, setTimeout(() => removeToast(id), duration));
  }, [removeToast]);

  // Clear any pending timers on unmount
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => clearTimeout(t));
  }, []);

  // Memoized so consumers get stable function identities (safe in effect deps)
  const value = useMemo(() => ({
    showToast,
    removeToast,
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    info: (msg, duration) => showToast(msg, 'info', duration)
  }), [showToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle color={ICON_COLORS.success} size={20} />}
            {toast.type === 'error' && <AlertCircle color={ICON_COLORS.error} size={20} />}
            {toast.type === 'info' && <Info color={ICON_COLORS.info} size={20} />}
            <span style={{ flex: 1, fontSize: '0.9rem' }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              style={{ background: 'none', border: 'none', color: '#b8b0b5', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
