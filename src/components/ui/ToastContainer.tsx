"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore, ToastType } from "@/store/useToastStore";

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)", icon: "#34d399" },
  error: { bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)", icon: "#f87171" },
  info: { bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.25)", icon: "#60a5fa" },
  warning: { bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)", icon: "#fbbf24" },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          const colors = COLORS[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl min-w-64 max-w-xs backdrop-blur-xl shadow-2xl border"
              style={{ background: colors.bg, borderColor: colors.border }}
            >
              <Icon size={16} style={{ color: colors.icon }} className="flex-shrink-0" />
              <span className="text-sm text-white font-medium flex-1 leading-snug">
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
