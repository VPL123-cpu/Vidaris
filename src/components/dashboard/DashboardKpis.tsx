"use client";

import { motion } from "framer-motion";
import { Clock, Flame, CalendarCheck, TrendingUp } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import {
  getWeekDates,
  getTotalMinutesForDate,
  formatDuration,
  calculateStreak,
} from "@/lib/utils";

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  iconColor: string;
  iconBg: string;
  index: number;
}

function KpiCard({ icon: Icon, label, value, sub, iconColor, iconBg, index }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5 flex items-start gap-4 hover:border-white/10 transition-colors group"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={18} style={{ color: iconColor }} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1.5">{sub}</p>
      </div>
    </motion.div>
  );
}

export function DashboardKpis() {
  const sessions = useStudyStore((s) => s.sessions);
  const weekDates = getWeekDates();
  const today = new Date().toISOString().split("T")[0];

  const weekTotal = weekDates.reduce(
    (acc, d) => acc + getTotalMinutesForDate(sessions, d),
    0
  );
  const todayMinutes = getTotalMinutesForDate(sessions, today);
  const daysValidated = weekDates.filter(
    (d) => getTotalMinutesForDate(sessions, d) >= 30 && d <= today
  ).length;
  const totalDaysThisWeek = weekDates.filter((d) => d <= today).length;
  const streak = calculateStreak(sessions);
  const avgMinutes =
    totalDaysThisWeek > 0 ? Math.round(weekTotal / totalDaysThisWeek) : 0;

  const kpis = [
    {
      icon: Clock,
      label: "Temps cette semaine",
      value: formatDuration(weekTotal),
      sub: `Aujourd'hui : ${formatDuration(todayMinutes)}`,
      iconColor: "#F5C044",
      iconBg: "rgba(245,192,68,0.12)",
    },
    {
      icon: Flame,
      label: "Série en cours",
      value: `${streak} jour${streak > 1 ? "s" : ""}`,
      sub: streak > 5 ? "Continue comme ça !" : "Objectif : 7 jours",
      iconColor: "#f97316",
      iconBg: "rgba(249,115,22,0.12)",
    },
    {
      icon: CalendarCheck,
      label: "Jours validés",
      value: `${daysValidated} / ${totalDaysThisWeek}`,
      sub: daysValidated === totalDaysThisWeek ? "Semaine parfaite !" : `${totalDaysThisWeek - daysValidated} jour(s) manqués`,
      iconColor: "#34d399",
      iconBg: "rgba(52,211,153,0.12)",
    },
    {
      icon: TrendingUp,
      label: "Moyenne quotidienne",
      value: formatDuration(avgMinutes),
      sub: avgMinutes >= 120 ? "Objectif atteint" : "Objectif : 2h/jour",
      iconColor: "#a78bfa",
      iconBg: "rgba(167,139,250,0.12)",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.label} {...kpi} index={i} />
      ))}
    </div>
  );
}
