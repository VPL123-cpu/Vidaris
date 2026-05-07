"use client";

import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { useStudyStore } from "@/store/useStudyStore";
import {
  getTotalMinutesForDate,
  getTodayKey,
  getWeekDates,
  calculateStreak,
  formatDuration,
} from "@/lib/utils";
import { CheckCircle2, Circle, Flame, Target, Zap } from "lucide-react";

const DAILY_GOAL = 120; // minutes
const WEEKLY_GOAL = 840; // minutes (14h)
const STREAK_GOAL = 7;

interface GoalCardProps {
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ElementType;
  color: string;
  index: number;
}

function GoalCard({ title, description, current, target, unit, icon: Icon, color, index }: GoalCardProps) {
  const pct = Math.min((current / target) * 100, 100);
  const done = current >= target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className={`bg-[#111827] border rounded-2xl p-4 transition-all ${
        done ? "border-emerald-500/20" : "border-white/[0.06] hover:border-white/10"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon size={17} style={{ color }} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm leading-tight">{title}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{description}</p>
          </div>
        </div>
        <AnimatedCheck done={done} />
      </div>

      {/* Values */}
      <div className="flex items-end gap-1 mb-3">
        <span className="text-2xl font-bold text-white tabular-nums">{current}</span>
        <span className="text-slate-500 text-xs mb-0.5">/ {target} {unit}</span>
      </div>

      {/* Progress */}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 + index * 0.08 }}
          className="h-full rounded-full"
          style={{
            background: done
              ? "linear-gradient(90deg, #34d399, #10b981)"
              : `linear-gradient(90deg, ${color}CC, ${color})`,
            boxShadow: done ? "0 0 12px rgba(52,211,153,0.4)" : `0 0 10px ${color}40`,
          }}
        />
      </div>

      <p className="text-xs text-slate-500 mt-2">
        {done ? "✓ Objectif atteint !" : `${Math.round(pct)}% · ${target - current} ${unit} restant${target - current > 1 ? "s" : ""}`}
      </p>
    </motion.div>
  );
}

function AnimatedCheck({ done }: { done: boolean }) {
  return done ? (
    <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
  ) : (
    <Circle size={20} className="text-slate-600 flex-shrink-0" />
  );
}

export default function GoalsPage() {
  const sessions = useStudyStore((s) => s.sessions);
  const today = getTodayKey();
  const weekDates = getWeekDates();

  const todayMinutes = getTotalMinutesForDate(sessions, today);
  const weekMinutes = weekDates.reduce(
    (acc, d) => acc + getTotalMinutesForDate(sessions, d),
    0
  );
  const streak = calculateStreak(sessions);

  const totalMinutes = sessions.reduce((acc, s) => acc + Math.floor(s.duration / 60), 0);
  const totalXP = totalMinutes * 2;

  const goals = [
    {
      title: "Objectif quotidien",
      description: `Étudier au moins ${formatDuration(DAILY_GOAL)} aujourd'hui`,
      current: Math.min(todayMinutes, DAILY_GOAL),
      target: DAILY_GOAL,
      unit: "min",
      icon: Target,
      color: "#F5C044",
    },
    {
      title: "Objectif hebdomadaire",
      description: `Atteindre ${formatDuration(WEEKLY_GOAL)} cette semaine`,
      current: Math.min(weekMinutes, WEEKLY_GOAL),
      target: WEEKLY_GOAL,
      unit: "min",
      icon: Zap,
      color: "#60a5fa",
    },
    {
      title: "Série de jours",
      description: `Maintenir une série de ${STREAK_GOAL} jours consécutifs`,
      current: Math.min(streak, STREAK_GOAL),
      target: STREAK_GOAL,
      unit: "jours",
      icon: Flame,
      color: "#f97316",
    },
    {
      title: "XP total",
      description: "Atteindre 1 000 XP (niveau 6)",
      current: Math.min(totalXP, 1000),
      target: 1000,
      unit: "XP",
      icon: Zap,
      color: "#a78bfa",
    },
  ];

  return (
    <PageContainer maxWidth="2xl">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Objectifs</h2>
          <p className="text-slate-400 text-sm mt-0.5">Suis ta progression vers tes objectifs</p>
        </div>

        {/* Global progress banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#F5C044]/10 to-[#f97316]/5 border border-[#F5C044]/15 rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-[#F5C044]/15 flex items-center justify-center flex-shrink-0">
            <Flame size={22} className="text-[#F5C044]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">
              {streak > 0
                ? `${streak} jour${streak > 1 ? "s" : ""} de suite — continue !`
                : "Lance ta premiere serie aujourd'hui"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {totalXP} XP accumules - {formatDuration(totalMinutes)} d&apos;etude au total
            </p>
          </div>
        </motion.div>

        {/* Goal cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {goals.map((goal, i) => (
            <GoalCard key={goal.title} {...goal} index={i} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
