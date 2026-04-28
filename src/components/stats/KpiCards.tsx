"use client";

import { motion } from "framer-motion";
import { TrendingUp, CalendarCheck, Zap, Clock } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import {
  getWeekDates,
  getTotalMinutesForDate,
  formatDuration,
  calculateStreak,
} from "@/lib/utils";

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
  delay?: number;
}

function KpiCard({ icon, label, value, sub, color = "#F5C044", delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 flex-1 min-w-0"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}18` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white leading-none mb-1">{value}</p>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

export function KpiCards({ period }: { period: "week" | "month" | "year" }) {
  const sessions = useStudyStore((s) => s.sessions);

  const weekDates = getWeekDates();
  const today = new Date().toISOString().split("T")[0];

  // Calculate based on period
  let dates: string[] = [];
  let daysInPeriod = 7;

  if (period === "week") {
    dates = weekDates;
    daysInPeriod = 7;
  } else if (period === "month") {
    daysInPeriod = 30;
    dates = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    });
  } else {
    daysInPeriod = 365;
    dates = Array.from({ length: 365 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    });
  }

  const totalMinutes = dates.reduce(
    (acc, d) => acc + getTotalMinutesForDate(sessions, d),
    0
  );

  const daysValidated = dates.filter(
    (d) => getTotalMinutesForDate(sessions, d) >= 30 && d <= today
  ).length;

  const totalDaysWithData = dates.filter((d) => d <= today).length;

  const streak = calculateStreak(sessions);

  const avgMinutes = totalDaysWithData > 0
    ? Math.round(totalMinutes / totalDaysWithData)
    : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <KpiCard
        icon={<Clock size={18} />}
        label={`Temps ${period === "week" ? "semaine" : period === "month" ? "mensuel" : "annuel"}`}
        value={formatDuration(totalMinutes)}
        sub={`~${formatDuration(avgMinutes)}/jour`}
        color="#F5C044"
        delay={0}
      />
      <KpiCard
        icon={<CalendarCheck size={18} />}
        label="Jours validés"
        value={`${daysValidated}/${Math.min(totalDaysWithData, daysInPeriod)}`}
        sub={daysValidated >= totalDaysWithData ? "Parfait !" : undefined}
        color="#34d399"
        delay={0.05}
      />
      <KpiCard
        icon={<TrendingUp size={18} />}
        label="Série actuelle"
        value={`${streak}j`}
        sub={streak > 5 ? "En feu 🔥" : streak > 0 ? "Continue !" : "Lance-toi !"}
        color="#f97316"
        delay={0.1}
      />
      <KpiCard
        icon={<Zap size={18} />}
        label="Moy. quotidienne"
        value={formatDuration(avgMinutes)}
        sub={avgMinutes >= 120 ? "Objectif atteint" : "Objectif : 2h"}
        color="#a78bfa"
        delay={0.15}
      />
    </div>
  );
}
