import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({
  type = 'success', // 'success' | 'error' | 'info' | 'warning'
  message,
  onClose,
  className = ''
}) {
  if (!message) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      bg: 'bg-slate-900 border-slate-700 text-white',
      iconColor: 'text-emerald-400'
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-950 border-red-800 text-white',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-amber-950 border-amber-800 text-white',
      iconColor: 'text-amber-400'
    },
    info: {
      icon: Info,
      bg: 'bg-indigo-950 border-indigo-800 text-white',
      iconColor: 'text-indigo-400'
    }
  };

  const config = typeConfig[type] || typeConfig.success;
  const Icon = config.icon;

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 max-w-md ${config.bg} ${className}`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${config.iconColor}`} />
      <span className="text-xs sm:text-sm font-semibold flex-1 leading-snug">
        {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
