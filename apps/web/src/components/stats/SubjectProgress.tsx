"use client";

import { motion } from "framer-motion";
import { useStudyStore } from "@/store/useStudyStore";
import { formatDuration, getTotalMinutesForSubject, getWeekDates } from "@/lib/utils";

interface SubjectProgressProps {
  period: "week" | "month" | "year";
}

export function SubjectProgress({ period }: SubjectProgressProps) {
  const sessions = useStudyStore((s) => s.sessions);
  const SUBJECTS = useStudyStore((s) => s.subjects);

  let dates: string[] | undefined;

  if (period === "week") {
    dates = getWeekDates();
  } else if (period === "month") {
    dates = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    });
  }

  const subjectData = SUBJECTS.map((sub) => {
    const done = getTotalMinutesForSubject(sessions, sub.id, dates);
    // sub.goal is in minutes per week
    const goalMinutes = sub.goal * (period === "week" ? 1 : period === "month" ? 4.3 : 52);
    const pct = Math.min((done / goalMinutes) * 100, 100);
    return { ...sub, done, goalMinutes: Math.round(goalMinutes), pct };
  }).sort((a, b) => b.done - a.done);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5 space-y-4"
    >
      <h3 className="text-sm font-semibold text-slate-300">
        Par matière
      </h3>

      {subjectData.map((sub, i) => (
        <motion.div
          key={sub.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
          className="space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: sub.color }}
              />
              <span className="font-medium text-slate-300">{sub.label}</span>
            </div>
            <span className="text-slate-400 tabular-nums font-medium">
              <span style={{ color: sub.color }}>{formatDuration(sub.done)}</span>
              {" / "}
              {formatDuration(sub.goalMinutes)}
            </span>
          </div>

          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${sub.pct}%` }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 + i * 0.06 }}
              className="h-full rounded-full relative overflow-hidden"
              style={{
                backgroundColor: sub.color,
                boxShadow: sub.pct > 10 ? `0 0 8px ${sub.color}60` : "none",
              }}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
