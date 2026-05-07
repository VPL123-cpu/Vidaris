"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { getWeekDates, getTotalMinutesForSubject, formatDuration } from "@/lib/utils";

export function DashboardSubjects() {
  const sessions = useStudyStore((s) => s.sessions);
  const subjects = useStudyStore((s) => s.subjects);
  const status = useStudyStore((s) => s.status);
  const elapsed = useStudyStore((s) => s.elapsed);
  const selectedSubjectId = useStudyStore((s) => s.selectedSubjectId);
  const weekDates = getWeekDates();

  const subjectData = subjects
    .map((sub) => {
      const done = getTotalMinutesForSubject(sessions, sub.id, weekDates);
      const liveExtra = (status === "running" && sub.id === selectedSubjectId)
        ? Math.floor(elapsed / 60)
        : 0;
      const total = done + liveExtra;
      const pct = Math.min((total / sub.goal) * 100, 100);
      return { ...sub, done: total, pct };
    })
    .sort((a, b) => b.done - a.done);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.35 }}
      className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Matières cette semaine
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Progression hebdomadaire
          </p>
        </div>
        <Link
          href="/subjects"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#F5C044] transition-colors"
        >
          Voir tout <ArrowRight size={12} />
        </Link>
      </div>

      <div className="space-y-3">
        {subjectData.map((sub, i) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.04 }}
            className="flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: sub.color }}
                />
                <span className="font-medium text-slate-300">{sub.label}</span>
              </div>
              <span className="text-slate-500 tabular-nums text-[11px]">
                <span
                  style={{
                    color: sub.pct >= 100 ? sub.color : undefined,
                  }}
                >
                  {formatDuration(sub.done)}
                </span>{" "}
                <span className="text-slate-600">/ {formatDuration(sub.goal)}</span>
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sub.pct}%` }}
                transition={{
                  duration: 0.7,
                  ease: "easeOut",
                  delay: 0.4 + i * 0.04,
                }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: sub.color,
                  boxShadow:
                    sub.pct > 5 ? `0 0 8px ${sub.color}50` : "none",
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
