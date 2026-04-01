import React from 'react';
import { useToast } from '../context/ToastContext';

export default function ToastContainer() {
  const { toasts } = useToast();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 left-5 z-[200] flex flex-col gap-2 items-start pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={[
            'px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white max-w-xs',
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-slate-800',
            toast.exiting ? 'toast-exit' : 'toast-enter',
          ].join(' ')}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
