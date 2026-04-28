"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { GlowButton } from "./GlowButton";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
  danger = true,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onCancel}
          />
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="bg-[#111827] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-5">
                {danger && (
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={18} className="text-red-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-semibold text-white">{title}</h3>
                  {description && (
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">{description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <GlowButton
                  variant="ghost"
                  size="sm"
                  glow={false}
                  onClick={onCancel}
                  className="flex-1"
                >
                  {cancelLabel}
                </GlowButton>
                <GlowButton
                  variant="outline"
                  size="sm"
                  glow={false}
                  onClick={onConfirm}
                  className={`flex-1 ${
                    danger
                      ? "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                      : "border-[#F5C044]/30 text-[#F5C044]"
                  }`}
                >
                  {confirmLabel}
                </GlowButton>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
