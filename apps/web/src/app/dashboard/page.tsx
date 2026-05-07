"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardKpisCompact } from "@/components/dashboard/DashboardKpis";
import { DashboardChart } from "@/components/dashboard/DashboardChart";
import { DashboardSubjects } from "@/components/dashboard/DashboardSubjects";
import { DashboardLeaderboard } from "@/components/dashboard/DashboardLeaderboard";
import { DashboardTimerRing } from "@/components/dashboard/DashboardTimerRing";

export default function DashboardPage() {
  return (
    <PageContainer maxWidth="xl">
      <div className="space-y-5">
        {/* Header : titre + KPIs compacts côte à côte */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-shrink-0">
            <h2 className="text-xl font-bold text-white">Bonne journée 👋</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Voici un aperçu de ta progression cette semaine.
            </p>
          </div>
          <div className="lg:w-[480px] xl:w-[520px]">
            <DashboardKpisCompact />
          </div>
        </div>

        {/* Main grid — 2×2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <DashboardChart />
          <DashboardTimerRing />
          <DashboardSubjects />
          <DashboardLeaderboard />
        </div>
      </div>
    </PageContainer>
  );
}
