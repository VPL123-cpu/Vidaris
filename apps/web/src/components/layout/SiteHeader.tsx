"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Play, Flame, LogOut, User } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useStudyStore } from "@/store/useStudyStore";
import { useAuthStore } from "@/store/useAuthStore";
import { calculateStreak } from "@/lib/utils";
import { getLevelProgress, calculateXP } from "@/lib/xp";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/timer": "Timer",
  "/stats": "Statistiques",
  "/subjects": "Matières",
  "/goals": "Objectifs",
  "/settings": "Paramètres",
  "/level": "Mon niveau",
  "/social": "Social",
};


export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const setMobileOpen = useUIStore((s) => s.setMobileOpen);
  const sessions = useStudyStore((s) => s.sessions);
  const timerStatus = useStudyStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const title = PAGE_TITLES[pathname] ?? "Vidaris";
  const totalMinutes = sessions.reduce(
    (acc, s) => acc + Math.floor(s.duration / 60),
    0
  );
  const streak = calculateStreak(sessions);
  const { level, xpInLevel, xpForLevel, progressPct } = getLevelProgress(
    calculateXP(totalMinutes, streak, 0)
  );
  const isTimerRunning = timerStatus === "running";

  return (
    <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-6 bg-[#0B0F1A]/80 backdrop-blur-md flex-shrink-0 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <Menu size={18} />
        </button>
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-base font-semibold text-white"
        >
          {title}
        </motion.h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Streak badge */}
        {streak > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Flame size={13} className="text-orange-400" fill="currentColor" />
            <span className="text-orange-400 font-bold text-xs">{streak}j</span>
          </div>
        )}

        {/* XP pill */}
        <button
          onClick={() => router.push("/level")}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-[#F5C044]/30 hover:bg-[#F5C044]/[0.05] transition-all"
        >
          <span className="text-xs font-bold text-[#F5C044]">Nv.{level}</span>
          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#F5C044] to-[#f7cb6a] rounded-full"
            />
          </div>
          <span className="text-[10px] text-slate-500 tabular-nums hidden lg:inline">
            {xpInLevel}/{xpForLevel}
          </span>
        </button>

        {/* Start session */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { if (pathname !== "/timer") router.push("/timer"); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isTimerRunning
              ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
              : "bg-[#F5C044] text-[#0B0F1A] shadow-[0_0_16px_rgba(245,192,68,0.25)] hover:bg-[#f7cb6a]"
          }`}
        >
          <Play size={12} fill="currentColor" />
          <span className="hidden sm:inline">
            {isTimerRunning ? "En cours" : "Démarrer"}
          </span>
        </motion.button>

        {/* User / auth */}
        {user ? (
          <div className="relative group">
            <button className="w-8 h-8 rounded-xl bg-[#F5C044]/15 flex items-center justify-center text-[#F5C044] hover:bg-[#F5C044]/25 transition-colors">
              <User size={15} />
            </button>
            <div className="absolute right-0 top-full mt-2 min-w-[160px] bg-[#161d2e] border border-white/10 rounded-xl shadow-xl overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
              <div className="px-3 py-2.5 border-b border-white/[0.06]">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
              >
                <LogOut size={13} />
                Se déconnecter
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5"
          >
            Connexion
          </button>
        )}
      </div>
    </header>
  );
}
