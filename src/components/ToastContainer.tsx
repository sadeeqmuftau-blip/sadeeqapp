import React, { useEffect, useState } from 'react';
import { ToastAlert, NotificationService } from '../services/notificationService';
import { X, Zap, Sparkles, TrendingUp, Bell } from 'lucide-react';

interface ToastContainerProps {
  onSelectPair?: (symbol: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ onSelectPair }) => {
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  useEffect(() => {
    return NotificationService.subscribeToasts((list) => {
      setToasts(list);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto rounded-2xl bg-slate-900/95 border border-emerald-500/40 p-4 shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 animate-slide-up transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
              {toast.type === 'gem' ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 animate-bounce" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">
                {toast.title}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                {toast.message}
              </p>
              <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                {new Date(toast.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => NotificationService.dismissToast(toast.id)}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
