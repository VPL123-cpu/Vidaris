import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardKpis } from "@/components/dashboard/DashboardKpis";
import { DashboardChart } from "@/components/dashboard/DashboardChart";
import { DashboardSubjects } from "@/components/dashboard/DashboardSubjects";
import { DashboardLeaderboard } from "@/components/dashboard/DashboardLeaderboard";
import { DashboardTimerRing } from "@/components/dashboard/DashboardTimerRing";

export default function DashboardPage() {
  return (
    <PageContainer maxWidth="xl">
      <div className="space-y-5">
        {/* Welcome */}
        <div>
          <h2 className="text-xl font-bold text-white">Bonne journée 👋</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Voici un aperçu de ta progression cette semaine.
          </p>
        </div>

        {/* KPIs */}
        <DashboardKpis />

        {/* Main grid — gauche 2fr, droite 1fr */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Colonne gauche (2/3) : Activité + Matières */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <DashboardChart />
            <DashboardSubjects />
          </div>

          {/* Colonne droite (1/3) : Timer + Classement */}
          <div className="flex flex-col gap-5">
            <DashboardTimerRing />
            <DashboardLeaderboard />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
