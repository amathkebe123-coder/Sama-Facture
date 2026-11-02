"use client";

import React from "react";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";

export type FormNotificationType = "success" | "info" | "error" | null;

export interface FormNotificationProps {
  type: FormNotificationType;
  message: string | null;
  onClose?: () => void;
  className?: string;
}

export function FormNotification({
  type,
  message,
  onClose,
  className = "",
}: FormNotificationProps) {
  if (!type || !message) return null;

  const styles = {
    success: {
      bg: "bg-emerald-50 border-emerald-200/80 text-emerald-800",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    },
    info: {
      bg: "bg-slate-100 border-slate-200/90 text-slate-800",
      icon: <Info className="w-4 h-4 text-slate-500 shrink-0" />,
    },
    error: {
      bg: "bg-rose-50 border-rose-200/80 text-rose-800",
      icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    },
  }[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-between gap-3 p-3.5 border rounded-xl text-xs sm:text-sm font-medium animate-in fade-in duration-150 ${styles.bg} ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {styles.icon}
        <span className="truncate">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Masquer la notification"
          className="p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
        </button>
      )}
    </div>
  );
}

