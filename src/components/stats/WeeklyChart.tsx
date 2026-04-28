"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Tooltip,
} from "recharts";
import { useStudyStore } from "@/store/useStudyStore";
import { getWeekDates, getTotalMinutesForDate } from "@/lib/utils";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const GOAL_MINUTES = 120;

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((acc, p) => acc + (p.value ?? 0), 0);

  return (
    <div className="bg-[#161d2e] border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-xs font-semibold text-slate-300 mb-2">{label}</p>
      {payload.map((p) =>
        p.value > 0 ? (
          <div key={p.name} className="flex items-center gap-2 text-xs">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-slate-400">{p.name}</span>
            <span className="text-white font-semibold ml-auto pl-4">
              {p.value}min
            </span>
          </div>
        ) : null
      )}
      {total > 0 && (
        <div className="border-t border-white/10 mt-2 pt-2 flex justify-between text-xs">
          <span className="text-slate-400">Total</span>
          <span className="text-[#F5C044] font-bold">{total}min</span>
        </div>
      )}
    </div>
  );
}

interface WeeklyChartProps {
  period: "week" | "month" | "year";
}

export function WeeklyChart({ period }: WeeklyChartProps) {
  const sessions = useStudyStore((s) => s.sessions);
  const subjects = useStudyStore((s) => s.subjects);
  const weekDates = getWeekDates();

  interface DataPoint {
    day: string;
    [key: string]: number | string;
  }

  let data: DataPoint[] = [];

  if (period === "week") {
    data = weekDates.map((date, i) => {
      const daySessions = sessions.filter((s) => s.date === date);
      const entry: DataPoint = { day: DAY_LABELS[i] };

      subjects.forEach((sub) => {
        const mins = daySessions
          .filter((s) => s.subjectId === sub.id)
          .reduce((acc, s) => acc + Math.floor(s.duration / 60), 0);
        entry[sub.id] = mins;
      });

      return entry;
    });
  } else if (period === "month") {
    // Group by week
    for (let week = 0; week < 4; week++) {
      const weekDates2 = Array.from({ length: 7 }, (_, d) => {
        const date = new Date();
        date.setDate(date.getDate() - (3 - week) * 7 - (6 - d));
        return date.toISOString().split("T")[0];
      });

      const entry: DataPoint = {
        day: `S${week + 1}`,
      };

      subjects.forEach((sub) => {
        const mins = weekDates2.reduce((acc, date) => {
          return (
            acc +
            sessions
              .filter((s) => s.date === date && s.subjectId === sub.id)
              .reduce((a, s) => a + Math.floor(s.duration / 60), 0)
          );
        }, 0);
        entry[sub.id] = mins;
      });

      data.push(entry);
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const todayIndex = weekDates.indexOf(today);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5"
    >
      <h3 className="text-sm font-semibold text-slate-300 mb-4">
        Activité{" "}
        <span className="text-slate-500 font-normal">
          {period === "week" ? "cette semaine" : "ce mois"}
        </span>
      </h3>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="30%" barGap={0}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#475569", fontSize: 10 }}
            tickFormatter={(v) => `${v}m`}
            width={32}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <ReferenceLine
            y={GOAL_MINUTES}
            stroke="#F5C044"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
            label={{
              value: "Objectif",
              position: "insideTopRight",
              fill: "#F5C044",
              fontSize: 10,
              opacity: 0.6,
            }}
          />
          {subjects.map((sub, i) => (
            <Bar
              key={sub.id}
              dataKey={sub.id}
              stackId="a"
              fill={sub.color}
              name={sub.label}
              radius={i === subjects.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fillOpacity={
                    period === "week" && index === todayIndex ? 1 : 0.75
                  }
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-4 border-t border-white/[0.06]">
        {subjects.map((sub) => {
          const hasData = data.some((d) => ((d[sub.id] as number) ?? 0) > 0);
          if (!hasData) return null;
          return (
            <div key={sub.id} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: sub.color }}
              />
              <span className="text-xs text-slate-500">{sub.label}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
