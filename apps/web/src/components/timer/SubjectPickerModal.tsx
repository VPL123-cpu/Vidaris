"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";

interface Props {
  open: boolean;
  onSelect: (subjectId: string) => void;
  onClose: () => void;
}

export function SubjectPickerModal({ open, onSelect, onClose }: Props) {
  const subjects = useStudyStore((s) => s.subjects);
  const selectedSubjectId = useStudyStore((s) => s.selectedSubjectId);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="bg-[#161d2e] border border-white/[0.08] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.7)] w-full max-w-xs pointer-events-auto"
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-[#F5C044]" />
                  <h3 className="text-sm font-semibold text-white">Choisir une matière</h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="p-2 max-h-64 overflow-y-auto">
                {subjects.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">
                    Aucune matière configurée
                  </p>
                ) : (
                  subjects.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSelect(s.id)}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all ${
                        selectedSubjectId === s.id
                          ? "bg-white/[0.07]"
                          : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: s.color,
                          boxShadow: `0 0 6px ${s.color}80`,
                        }}
                      />
                      <span
                        className="text-sm font-medium flex-1"
                        style={{ color: selectedSubjectId === s.id ? s.color : "#cbd5e1" }}
                      >
                        {s.label}
                      </span>
                      {selectedSubjectId === s.id && (
                        <span className="text-xs font-bold" style={{ color: s.color }}>✓</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
