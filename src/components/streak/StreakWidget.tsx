"use client";

import { motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { calculateStreak, getTotalMinutesForDate, getTodayKey } from "@/lib/utils";
import { getStreakMessage, getStreakMultiplier } from "@/lib/streak";

export function StreakWidget() {
  const sessions = useStudyStore((s) => s.sessions);
  const streakConfig = useStudyStore((s) => s.streakConfig);

  if (!streakConfig.enabled) return null;

  const streak = calculateStreak(sessions, streakConfig.minMinutes);
  const todayMinutes = getTotalMinutesForDate(sessions, getTodayKey());
  const todayValidated = todayMinutes >= streakConfig.minMinutes;
  const todayPct = Math.min((todayMinutes / streakConfig.minMinutes) * 100, 100);
  const multiplier = getStreakMultiplier(streak);
  const glowOpacity = Math.min(0.15 + streak * 0.015, 0.55);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-[#111827] border border-white/[0.06] rounded-2xl p-5 overflow-hidden"
    >
      {streak > 0 && (
        <div
          className="absolute -top-4 -left-4 w-40 h-40 rounded-full blur-3xl pointer-events-none"
          style={{ background: `rgba(249,115,22,${glowOpacity * 0.35})` }}
        />
      )}

      <div className="relative flex items-start gap-4">
        {/* Flame */}
        <motion.div
          animate={streak > 0 ? { scale: [1, 1.07, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: streak > 0
              ? "rgba(249,115,22,0.15)"
              : "rgba(255,255,255,0.04)",
            border: `1px solid ${streak > 0 ? "rgba(249,115,22,0.3)" : "rgba(255,255,255,0.06)"}`,
            boxShadow: streak > 0
              ? `0 0 ${Math.min(16 + streak * 1.5, 36)}px rgba(249,115,22,${glowOpacity})`
              : "none",
          }}
        >
          <Flame
            size={28}
            className={streak > 0 ? "text-orange-400" : "text-slate-600"}
            fill={streak > 0 ? "currentColor" : "none"}
          />
        </motion.div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tabular-nums">{streak}</span>
              <span className="text-sm font-medium text-slate-400">
                {streak === 1 ? "jour" : "jours"}
              </span>
            </div>
            {multiplier > 1 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F5C044]/10 border border-[#F5C044]/20 flex-shrink-0">
                <Zap size={11} className="text-[#F5C044]" fill="currentColor" />
                <span className="text-xs font-bold text-[#F5C044]">×{multiplier} XP</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{getStreakMessage(streak)}</p>
        </div>
      </div>

      {/* Today progress */}
      <div className="relative mt-4 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Aujourd'hui</span>
          {todayValidated ? (
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-emerald-400 font-semibold"
            >
              ✓ Validé !
            </motion.span>
          ) : (
            <span className="text-slate-500 tabular-nums">
              {todayMinutes} / {streakConfig.minMinutes} min
            </span>
          )}
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${todayPct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: todayValidated
                ? "linear-gradient(90deg, #34d399, #10b981)"
                : "linear-gradient(90deg, #fb923c, #f97316)",
              boxShadow: todayValidated
                ? "0 0 8px rgba(52,211,153,0.5)"
                : "0 0 8px rgba(249,115,22,0.4)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
