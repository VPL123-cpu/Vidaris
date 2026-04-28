"use client";

import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { useStudyStore } from "@/store/useStudyStore";
import {
  calculateXP, getLevelProgress, getLevel, getXPRange, getLevelName,
  XP_PER_MINUTE, XP_PER_STREAK_DAY, XP_GOAL_BONUS, XP_LEVELS, LEVEL_NAMES,
} from "@/lib/xp";
import { calculateStreak, formatDuration } from "@/lib/utils";
import { Zap, Flame, Target, Clock, Trophy, Star, TrendingUp } from "lucide-react";

const XP_SOURCES = [
  {
    icon: Clock,
    label: "Temps étudié",
    value: `${XP_PER_MINUTE} XP / minute`,
    description: "Chaque minute d'étude te rapporte des XP",
    color: "#F5C044",
  },
  {
    icon: Flame,
    label: "Série active",
    value: `${XP_PER_STREAK_DAY} XP / jour de série`,
    description: "Maintiens ta série quotidienne pour multiplier les gains",
    color: "#f97316",
  },
  {
    icon: Target,
    label: "Objectifs atteints",
    value: `${XP_GOAL_BONUS} XP / objectif`,
    description: "Atteins tes objectifs hebdomadaires par matière",
    color: "#34d399",
  },
];

export default function LevelPage() {
  const sessions = useStudyStore((s) => s.sessions);
  const streak = calculateStreak(sessions);
  const totalMinutes = sessions.reduce((acc, s) => acc + Math.floor(s.duration / 60), 0);
  const totalXP = calculateXP(totalMinutes, streak, 0);

  const { level, name, xpInLevel, xpForLevel, progressPct } = getLevelProgress(totalXP);

  const nextLevel = Math.min(level + 1, XP_LEVELS.length);
  const { next: nextLevelXP } = getXPRange(level);
  const xpToNext = Math.max(0, nextLevelXP - totalXP);

  return (
    <PageContainer maxWidth="lg">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Mon niveau</h2>
          <p className="text-slate-400 text-sm mt-0.5">Progression et système de récompenses</p>
        </div>

        {/* Main level card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-[#1a1f35] to-[#111827] border border-[#F5C044]/20 rounded-2xl p-6 overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5C044]/[0.05] rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Level badge */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#F5C044] to-[#e8a820] flex flex-col items-center justify-center shadow-[0_0_40px_rgba(245,192,68,0.4)]">
                <span className="text-3xl font-black text-[#0B0F1A]">{level}</span>
                <span className="text-[10px] font-bold text-[#0B0F1A]/70 uppercase tracking-wider">niveau</span>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#F5C044] flex items-center justify-center">
                <Star size={10} className="text-[#0B0F1A]" fill="currentColor" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-white">{name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#F5C044]/15 text-[#F5C044] font-semibold border border-[#F5C044]/20">
                  {totalXP} XP
                </span>
              </div>

              {level < XP_LEVELS.length && (
                <p className="text-sm text-slate-400 mb-3">
                  Plus que <span className="text-white font-semibold">{xpToNext} XP</span> pour atteindre le niveau {nextLevel} — {getLevelName(nextLevel)}
                </p>
              )}

              {/* XP bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{xpInLevel} XP dans ce niveau</span>
                  <span>{xpForLevel} XP requis</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ background: "linear-gradient(90deg, #F5C044, #f7cb6a)" }}
                  >
                    <div className="absolute inset-0 progress-shimmer" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/[0.06]">
            {[
              { icon: Clock, label: "Temps total", value: formatDuration(totalMinutes), color: "#F5C044" },
              { icon: Flame, label: "Série actuelle", value: `${streak}j`, color: "#f97316" },
              { icon: Zap, label: "XP total", value: `${totalXP}`, color: "#a78bfa" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-1.5">
                  <Icon size={16} style={{ color }} />
                </div>
                <p className="text-lg font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* XP Sources */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Comment gagner de l'XP ?</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {XP_SOURCES.map(({ icon: Icon, label, value, description, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <p className="text-sm font-semibold text-white mb-0.5">{label}</p>
                <p className="text-xs font-bold mb-1.5" style={{ color }}>{value}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Level roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Parcours des niveaux</h3>
          </div>
          <div className="space-y-2">
            {LEVEL_NAMES.map((levelName, i) => {
              const lvl = i + 1;
              const xpRequired = XP_LEVELS[i];
              const isUnlocked = level >= lvl;
              const isCurrent = level === lvl;

              return (
                <motion.div
                  key={lvl}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isCurrent
                      ? "bg-[#F5C044]/10 border border-[#F5C044]/20"
                      : isUnlocked
                      ? "bg-white/[0.03]"
                      : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      isCurrent
                        ? "bg-[#F5C044] text-[#0B0F1A]"
                        : isUnlocked
                        ? "bg-white/10 text-white"
                        : "bg-white/5 text-slate-600"
                    }`}
                  >
                    {lvl}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isCurrent ? "text-[#F5C044]" : isUnlocked ? "text-white" : "text-slate-600"}`}>
                      {levelName}
                    </p>
                    <p className="text-xs text-slate-600">{xpRequired} XP</p>
                  </div>
                  {isCurrent && (
                    <span className="text-xs font-semibold text-[#F5C044] bg-[#F5C044]/10 px-2 py-0.5 rounded-full border border-[#F5C044]/20">
                      Actuel
                    </span>
                  )}
                  {isUnlocked && !isCurrent && (
                    <span className="text-xs text-emerald-400">✓</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
}
