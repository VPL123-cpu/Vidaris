"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { getTotalMinutesForDate, formatDuration } from "@/lib/utils";

type Period = "week" | "month" | "year";

const PERIODS: { key: Period; label: string }[] = [
  { key: "week", label: "Semaine" },
  { key: "month", label: "Mois" },
  { key: "year", label: "Année" },
];

const GOAL_MINUTES = 120;
const MONTHS_FR = ["jan","fév","mar","avr","mai","jun","jul","aoû","sep","oct","nov","déc"];
const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function getMondayForOffset(offset: number): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff + offset * 7);
  return monday;
}

function getWeekLabel(offset: number): string {
  const monday = getMondayForOffset(offset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => `${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
  if (offset === 0) return "Cette semaine";
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

function buildDateRange(
  period: Period,
  weekOffset = 0
): { date: string; label: string }[] {
  const today = new Date();

  if (period === "week") {
    const monday = getMondayForOffset(weekOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return { date: d.toISOString().split("T")[0], label: DAY_LABELS[i] };
    });
  }

  if (period === "month") {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (29 - i));
      return {
        date: d.toISOString().split("T")[0],
        label:
          i === 29
            ? "Auj."
            : d.getDate() % 5 === 0
            ? `${d.getDate()}/${d.getMonth() + 1}`
            : "",
      };
    });
  }

  // year: last 12 months
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
    return {
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: MONTHS_FR[d.getMonth()],
    };
  });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length || !payload[0].value) return null;
  return (
    <div className="bg-[#161d2e] border border-[#F5C044]/20 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-[#F5C044]">
        {formatDuration(payload[0].value)}
      </p>
    </div>
  );
}

export function DashboardChart() {
  const [period, setPeriod] = useState<Period>("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const sessions = useStudyStore((s) => s.sessions);
  const status = useStudyStore((s) => s.status);
  const elapsed = useStudyStore((s) => s.elapsed);

  function navigate(dir: -1 | 1) {
    setDirection(dir);
    setWeekOffset((v) => v + dir);
  }

  function handlePeriodChange(p: Period) {
    setPeriod(p);
    setWeekOffset(0);
  }

  const today = new Date().toISOString().split("T")[0];

  const data = useMemo(() => {
    const range = buildDateRange(period, weekOffset);
    // Minutes du chrono en cours (mise à jour chaque seconde)
    const liveMin = status === "running" ? Math.floor(elapsed / 60) : 0;

    if (period === "year") {
      const curMonth = today.slice(0, 7);
      return range.map(({ date, label }) => {
        const [year, month] = date.split("-");
        const totalSecs = sessions
          .filter((s) => s.date.startsWith(`${year}-${month}`))
          .reduce((acc, s) => acc + s.duration, 0);
        const mins = Math.floor(totalSecs / 60);
        return { label, minutes: mins + (date === curMonth ? liveMin : 0) };
      });
    }

    return range.map(({ date, label }) => {
      const base = date <= today ? getTotalMinutesForDate(sessions, date) : null;
      return {
        label,
        minutes: date === today && base !== null ? base + liveMin : base,
      };
    });
  }, [period, sessions, weekOffset, today, status, elapsed]);

  const totalMinutes = data.reduce((acc, d) => acc + (d.minutes ?? 0), 0);
  const activeDays = data.filter((d) => (d.minutes ?? 0) > 0).length;
  const avgMinutes =
    activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0;

  const hasData = data.some((d) => (d.minutes ?? 0) > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-white">Activité</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="text-white font-semibold">{formatDuration(totalMinutes)}</span>
            {avgMinutes > 0 && (
              <> · moy <span className="text-slate-300">{formatDuration(avgMinutes)}/j</span></>
            )}
          </p>
        </div>

        <div className="flex gap-0.5 p-0.5 bg-white/[0.04] rounded-xl border border-white/[0.06]">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handlePeriodChange(key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                period === key
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Week navigation */}
      {period === "week" && (
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <AnimatePresence mode="wait">
            <motion.span
              key={`${weekOffset}`}
              initial={{ opacity: 0, x: direction * 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 10 }}
              transition={{ duration: 0.18 }}
              className="text-xs font-medium text-slate-400"
            >
              {getWeekLabel(weekOffset)}
            </motion.span>
          </AnimatePresence>
          <button
            onClick={() => navigate(1)}
            disabled={weekOffset >= 0}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Chart — hauteur fixe pour que ResponsiveContainer résolve correctement */}
      <div className="h-[260px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${period}-${weekOffset}`}
            initial={{ opacity: 0, x: direction * 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 12 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {!hasData ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-slate-600">
                  Pas encore de données cette semaine
                </p>
              </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5C044" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#F5C044" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 10, fontWeight: 500 }}
                  interval={period === "month" ? 4 : 0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 10 }}
                  tickFormatter={(v) => `${v}m`}
                  width={40}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "rgba(245,192,68,0.15)",
                    strokeWidth: 1,
                  }}
                />
                {period === "week" && (
                  <ReferenceLine
                    y={GOAL_MINUTES}
                    stroke="#F5C044"
                    strokeDasharray="4 4"
                    strokeOpacity={0.3}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#F5C044"
                  strokeWidth={2.5}
                  fill="url(#goldGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#F5C044",
                    stroke: "#0B0F1A",
                    strokeWidth: 2,
                    filter: "drop-shadow(0 0 6px rgba(245,192,68,0.8))",
                  }}
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
