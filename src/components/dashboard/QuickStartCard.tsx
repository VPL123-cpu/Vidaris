"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Timer, Play, Zap, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useStudyStore } from "@/store/useStudyStore";

export function QuickStartCard() {
  const router = useRouter();
  const mode = useStudyStore((s) => s.mode);
  const setMode = useStudyStore((s) => s.setMode);
  const subjects = useStudyStore((s) => s.subjects);
  const selectedSubjectId = useStudyStore((s) => s.selectedSubjectId);
  const setSubject = useStudyStore((s) => s.setSubject);

  const [subjectOpen, setSubjectOpen] = useState(false);
  const subject = subjects.find((s) => s.id === selectedSubjectId) ?? subjects[0];

  function launch(m: "pomodoro" | "chrono") {
    setMode(m);
    router.push("/timer");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap size={13} className="text-[#F5C044]" fill="currentColor" />
        <h3 className="text-sm font-semibold text-white">Démarrage rapide</h3>
      </div>

      {/* Subject picker */}
      <div className="relative mb-3">
        <button
          onClick={() => setSubjectOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: subject?.color ?? "#F5C044" }}
            />
            <span className="text-sm font-medium text-slate-200 truncate">
              {subject?.label ?? "Matière"}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={`text-slate-500 transition-transform flex-shrink-0 ${subjectOpen ? "rotate-180" : ""}`}
          />
        </button>

        {subjectOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-full mt-1 w-full bg-[#161d2e] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden"
          >
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => { setSubject(sub.id); setSubjectOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                  sub.id === selectedSubjectId ? "text-white" : "text-slate-400"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: sub.color }}
                />
                {sub.label}
                {sub.id === selectedSubjectId && (
                  <span className="ml-auto text-[10px] text-[#F5C044]">●</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Mode buttons */}
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => launch("pomodoro")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === "pomodoro"
              ? "bg-[#F5C044] text-[#0B0F1A] shadow-[0_0_16px_rgba(245,192,68,0.3)]"
              : "bg-[#F5C044]/10 border border-[#F5C044]/20 text-[#F5C044] hover:bg-[#F5C044]/15"
          }`}
        >
          <Timer size={13} />
          Pomodoro
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => launch("chrono")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === "chrono"
              ? "bg-white/15 border border-white/25 text-white"
              : "bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.07]"
          }`}
        >
          <Play size={13} fill="currentColor" />
          Chrono
        </motion.button>
      </div>
    </motion.div>
  );
}
