"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { getSubjectFromList } from "@/lib/subjects";

export function SubjectSelector() {
  const [open, setOpen] = useState(false);
  const subjects = useStudyStore((s) => s.subjects);
  const selectedSubjectId = useStudyStore((s) => s.selectedSubjectId);
  const setSubject = useStudyStore((s) => s.setSubject);
  const status = useStudyStore((s) => s.status);
  const isDisabled = status === "running";

  const subject = getSubjectFromList(subjects, selectedSubjectId);

  return (
    <div className="relative">
      <button
        onClick={() => !isDisabled && setOpen((v) => !v)}
        disabled={isDisabled}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] hover:bg-white/8 hover:border-white/12 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: subject.color, boxShadow: `0 0 8px ${subject.color}` }}
        />
        <span className="text-sm font-medium text-white flex-1 text-left">{subject.label}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 mt-2 z-30 bg-[#161d2e] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
            >
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSubject(s.id); setOpen(false); }}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors duration-150 hover:bg-white/5 ${
                    selectedSubjectId === s.id ? "bg-white/[0.04]" : ""
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: s.color,
                      boxShadow: selectedSubjectId === s.id ? `0 0 8px ${s.color}` : "none",
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: selectedSubjectId === s.id ? s.color : "#94a3b8" }}
                  >
                    {s.label}
                  </span>
                  {selectedSubjectId === s.id && (
                    <span className="ml-auto text-xs font-medium" style={{ color: s.color }}>✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
