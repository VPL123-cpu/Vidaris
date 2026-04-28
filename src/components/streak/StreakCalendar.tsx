"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { buildCalendarDays } from "@/lib/streak";
import { formatDuration } from "@/lib/utils";

const DAY_LABELS_FR = ["L", "M", "M", "J", "V", "S", "D"];

export function StreakCalendar() {
  const sessions = useStudyStore((s) => s.sessions);
  const streakConfig = useStudyStore((s) => s.streakConfig);
  const [view, setView] = useState<7 | 30>(30);

  if (!streakConfig.enabled) return null;

  const days = buildCalendarDays(sessions, streakConfig.minMinutes, view);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-300">Régularité</h3>
        </div>
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/[0.04]">
          {([7, 30] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                view === v
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {v}j
            </button>
          ))}
        </div>
      </div>

      {/* Day labels for 7-day view */}
      {view === 7 && (
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {DAY_LABELS_FR.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-slate-600">
              {d}
            </div>
          ))}
        </div>
      )}

      {/* Dots grid */}
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: view === 7
            ? "repeat(7, minmax(0, 1fr))"
            : "repeat(10, minmax(0, 1fr))",
        }}
      >
        {days.map((day, i) => (
          <motion.div
            key={day.date}
            title={`${formatDuration(day.minutes)} — ${day.date}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.012, duration: 0.2 }}
            className={`aspect-square rounded-full cursor-default transition-all ${
              day.isToday
                ? "ring-2 ring-[#F5C044] ring-offset-[2px] ring-offset-[#111827]"
                : ""
            } ${
              day.validated
                ? "bg-[#F5C044]"
                : "bg-white/[0.06] hover:bg-white/10"
            }`}
            style={
              day.validated
                ? { boxShadow: day.isToday ? "0 0 10px rgba(245,192,68,0.6)" : "0 0 6px rgba(245,192,68,0.3)" }
                : {}
            }
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 h-3 rounded-full bg-[#F5C044]" />
          Validé
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 h-3 rounded-full bg-white/[0.06]" />
          Non validé
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 h-3 rounded-full ring-2 ring-[#F5C044] ring-offset-[2px] ring-offset-[#111827]" />
          Aujourd'hui
        </div>
      </div>
    </motion.div>
  );
}
