"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { KpiCards } from "@/components/stats/KpiCards";
import { WeeklyChart } from "@/components/stats/WeeklyChart";
import { SubjectProgress } from "@/components/stats/SubjectProgress";

const TABS = [
  { key: "week", label: "Semaine" },
  { key: "month", label: "Mois" },
  { key: "year", label: "Année" },
] as const;

type Period = "week" | "month" | "year";

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>("week");

  return (
    <PageContainer maxWidth="xl">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Statistiques</h2>
          <p className="text-slate-400 text-sm mt-0.5">Analyse détaillée de ta progression</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06] w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className="relative px-5 py-2 text-sm font-semibold rounded-lg transition-colors duration-200"
              style={{ color: period === tab.key ? "#fff" : "#64748b" }}
            >
              {period === tab.key && (
                <motion.div
                  layoutId="stats-tab"
                  className="absolute inset-0 bg-white/10 rounded-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        <KpiCards period={period} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            {period !== "year" && <WeeklyChart period={period} />}
            {period === "year" && (
              <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-8 flex items-center justify-center text-slate-500 text-sm h-64">
                Vue annuelle — graphique à venir
              </div>
            )}
          </div>
          <div>
            <SubjectProgress period={period} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
