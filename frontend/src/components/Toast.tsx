import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "warning" | "error";
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const bgBorder =
    toast.type === "success"
      ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-200"
      : toast.type === "warning"
      ? "bg-amber-950/80 border-amber-500/50 text-amber-200"
      : "bg-rose-950/80 border-rose-500/50 text-rose-200";

  const Icon =
    toast.type === "success"
      ? CheckCircle2
      : toast.type === "warning"
      ? AlertTriangle
      : XCircle;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce-in">
      <div className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${bgBorder}`}>
        <Icon className="w-6 h-6 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{toast.title}</h4>
          <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
          <X className="w-4 h-4 opacity-70" />
        </button>
      </div>
    </div>
  );
};
