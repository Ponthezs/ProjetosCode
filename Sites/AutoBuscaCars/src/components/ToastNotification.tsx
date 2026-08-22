'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export default function ToastNotification() {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 animate-bounce transition-all duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700 backdrop-blur-md'
            : toast.type === 'error'
            ? 'bg-rose-900/90 text-rose-100 border-rose-700 backdrop-blur-md'
            : 'bg-slate-800/95 text-slate-100 border-slate-700 backdrop-blur-md'
        }`}
      >
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
