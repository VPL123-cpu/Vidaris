"use client";

import { motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { calculateStreak } from "@/lib/utils";

const XP_PER_MINUTE = 2;
const XP_LEVELS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2550, 3300];

function getLevel(xp: number) {
  let level = 1;
  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i]) level = i + 1;
  }
  return level;
}

function getXPRange(level: number) {
  const current = XP_LEVELS[level - 1] ?? 0;
  const next = XP_LEVELS[level] ?? current + 1000;
  return { current, next };
}

export function Header() {
  const sessions = useStudyStore((s) => s.sessions);

  const totalMinutes = sessions.reduce((acc, s) => acc + Math.floor(s.duration / 60), 0);
  const totalXP = totalMinutes * XP_PER_MINUTE;
  const level = getLevel(totalXP);
  const { current, next } = getXPRange(level);
  const xpInLevel = totalXP - current;
  const xpForLevel = next - current;
  const progress = Math.min((xpInLevel / xpForLevel) * 100, 100);

  const streak = calculateStreak(sessions);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-0.5">Bonne chance aujourd'hui</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Niveau {level}
          </h1>
        </div>

        {streak > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20"
          >
            <Flame size={16} className="text-orange-400" fill="currentColor" />
            <span className="text-orange-400 font-bold text-sm">{streak}</span>
          </motion.div>
        )}
      </div>

      {/* XP Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap size={12} className="text-[#F5C044]" />
            <span className="text-xs text-slate-400 font-medium">
              {xpInLevel} / {xpForLevel} XP
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {streak > 0 ? "Ne casse pas ta série !" : "Lance ta série aujourd'hui"}
          </span>
        </div>

        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-[#F5C044] to-[#f7cb6a] relative overflow-hidden"
          >
            <div className="absolute inset-0 progress-shimmer" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
