"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useStudyStore } from "@/store/useStudyStore";
import { getSubjectFromList } from "@/lib/subjects";
import { formatDurationFromSeconds, getTodayKey } from "@/lib/utils";
import { Clock } from "lucide-react";

export function TodaySessions() {
  const sessions = useStudyStore((s) => s.sessions);
  const subjects = useStudyStore((s) => s.subjects);
  const todaySessions = sessions
    .filter((s) => s.date === getTodayKey())
    .sort((a, b) => b.createdAt - a.createdAt);

  if (todaySessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-8 text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
          <Clock size={20} className="text-slate-500" />
        </div>
        <p className="text-slate-500 text-sm">Aucune session aujourd'hui</p>
        <p className="text-slate-600 text-xs mt-1">Lance le timer pour commencer</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
        Aujourd'hui
      </h3>
      <AnimatePresence initial={false}>
        {todaySessions.map((session, i) => {
          const subject = getSubjectFromList(subjects, session.subjectId);
          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-colors"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: subject.color,
                  boxShadow: `0 0 6px ${subject.color}60`,
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {subject.label}
                </p>
                <p className="text-xs text-slate-500">
                  {session.mode === "pomodoro" ? "Pomodoro" : "Chrono"}
                </p>
              </div>
              <span className="text-sm font-semibold text-slate-300 tabular-nums">
                {formatDurationFromSeconds(session.duration)}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
