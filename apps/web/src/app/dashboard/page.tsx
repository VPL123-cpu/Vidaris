"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardKpisRow } from "@/components/dashboard/DashboardKpis";
import { DashboardChart } from "@/components/dashboard/DashboardChart";
import { DashboardSubjects } from "@/components/dashboard/DashboardSubjects";
import { DashboardLeaderboard } from "@/components/dashboard/DashboardLeaderboard";
import { DashboardTimerRing } from "@/components/dashboard/DashboardTimerRing";

export default function DashboardPage() {
  return (
    <PageContainer maxWidth="2xl">
      <div className="space-y-4">
        {/* 4 KPIs en ligne */}
        <DashboardKpisRow />

        {/* Grid principal : gauche 40% (chart + matières), droite 60% (timer + classement) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
          {/* Colonne gauche : Activité + Matières cette semaine */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <DashboardChart />
            <DashboardSubjects />
          </div>

          {/* Colonne droite : Timer (en haut) + Classement */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <DashboardTimerRing />
            <DashboardLeaderboard />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
