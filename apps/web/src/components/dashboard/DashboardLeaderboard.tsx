"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, Flame, ArrowRight, Crown, UserPlus } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { useAuthStore } from "@/store/useAuthStore";
import { calculateStreak, formatDuration } from "@/lib/utils";

export function DashboardLeaderboard() {
  const sessions = useStudyStore((s) => s.sessions);
  const streakConfig = useStudyStore((s) => s.streakConfig);
  const friendships = useStudyStore((s) => s.friendships);
  const user = useAuthStore((s) => s.user);

  const streak = calculateStreak(sessions, streakConfig.minMinutes);
  const totalMinutes = sessions.reduce((acc, s) => acc + Math.floor(s.duration / 60), 0);
  const name = user?.name ?? "Toi";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5 flex flex-col h-full min-h-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={15} className="text-[#F5C044]" />
          <h3 className="text-sm font-semibold text-white">Classement</h3>
        </div>
        <Link
          href="/social"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#F5C044] transition-colors"
        >
          Voir tout <ArrowRight size={12} />
        </Link>
      </div>

      <div className="flex-1 space-y-2">
        {/* User row — real data */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#F5C044]/8 border border-[#F5C044]/20"
        >
          <span className="w-5 text-xs font-bold text-[#F5C044] text-center flex-shrink-0">
            <Crown size={13} className="mx-auto" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#F5C044] truncate">{name}</p>
            <p className="text-[10px] text-[#F5C044]/50">toi</p>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="flex items-center gap-1 text-xs font-semibold text-orange-400">
              <Flame size={11} />
              {streak}j
            </span>
            <span className="text-[10px] text-slate-500 tabular-nums">
              {formatDuration(totalMinutes)}
            </span>
          </div>
        </motion.div>

        {friendships.filter((friendship) => friendship.status === "accepted").length === 0 && (
          <div className="px-3 py-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
            <p className="text-xs text-slate-500">Aucun ami pour l&apos;instant</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <Link
        href="/social"
        className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-semibold text-slate-400 hover:text-[#F5C044] hover:border-[#F5C044]/20 hover:bg-[#F5C044]/5 transition-all"
      >
        <UserPlus size={13} />
        Inviter des amis
      </Link>
    </motion.div>
  );
}
