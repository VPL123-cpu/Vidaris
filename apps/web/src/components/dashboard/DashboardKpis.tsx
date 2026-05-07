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

function useKpis() {
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

  return [
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
}

// Compact variant — affichée à côté du titre
export function DashboardKpisCompact() {
  const kpis = useKpis();

  return (
    <div className="grid grid-cols-2 gap-2">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="bg-[#111827] border border-white/[0.06] rounded-xl px-3 py-2.5 flex items-center gap-2.5 hover:border-white/10 transition-colors"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: kpi.iconBg }}
            >
              <Icon size={13} style={{ color: kpi.iconColor }} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 leading-tight truncate">{kpi.label}</p>
              <p className="text-sm font-bold text-white leading-tight">{kpi.value}</p>
              <p className="text-[10px] text-slate-600 leading-tight truncate">{kpi.sub}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
