"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Timer, ArrowRight } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { formatTime } from "@/lib/utils";
import { getSubjectFromList } from "@/lib/subjects";

export function DashboardTimerStatus() {
  const status = useStudyStore((s) => s.status);
  const remaining = useStudyStore((s) => s.remaining);
  const elapsed = useStudyStore((s) => s.elapsed);
  const mode = useStudyStore((s) => s.mode);
  const selectedSubjectId = useStudyStore((s) => s.selectedSubjectId);
  const subjects = useStudyStore((s) => s.subjects);
  const pomodoroPhase = useStudyStore((s) => s.pomodoroPhase);

  const isRunning = status === "running";
  const sub = getSubjectFromList(subjects, selectedSubjectId);

  return (
    <AnimatePresence>
      {isRunning && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Link href="/timer" className="block">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 hover:border-emerald-500/30 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <Timer size={18} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                    Session active — {pomodoroPhase === "work" ? "Concentration" : "Pause"}
                  </span>
                </div>
                <p className="text-sm text-slate-300">
                  <span
                    className="font-semibold"
                    style={{ color: sub.color }}
                  >
                    {sub.label}
                  </span>
                  {" · "}
                  <span className="font-mono">
                    {mode === "chrono" ? formatTime(elapsed) : formatTime(remaining)}
                  </span>
                  {mode === "pomodoro" ? " restant" : " écoulé"}
                </p>
              </div>
              <ArrowRight size={16} className="text-slate-500 flex-shrink-0" />
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
