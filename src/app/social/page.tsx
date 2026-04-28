"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { useStudyStore } from "@/store/useStudyStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  calculateStreak,
  getTotalMinutesForDate,
  formatDuration,
  getTodayKey,
} from "@/lib/utils";
import { getStreakMessage, getStreakMultiplier } from "@/lib/streak";
import {
  Flame, Users, Trophy, Clock, Copy, Check,
  UserPlus, Crown, Lock, Medal,
} from "lucide-react";

type SocialTab = "classement" | "amis";
type LeaderboardSort = "streak" | "temps";

// ─── My streak card ─────────────────────────────────────────────────────────

function MyStreakCard({
  name,
  streak,
  todayMinutes,
  minMinutes,
}: {
  name: string;
  streak: number;
  todayMinutes: number;
  minMinutes: number;
}) {
  const todayValidated = todayMinutes >= minMinutes;
  const multiplier = getStreakMultiplier(streak);
  const glowOpacity = Math.min(0.12 + streak * 0.012, 0.45);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-[#1a1f35] to-[#111827] border border-[#F5C044]/20 rounded-2xl p-6 overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl pointer-events-none"
        style={{ background: `rgba(249,115,22,${glowOpacity})` }}
      />
      <div className="relative flex items-center gap-5">
        {/* Flame */}
        <motion.div
          animate={streak > 0 ? { scale: [1, 1.07, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(249,115,22,0.15)",
            border: "1px solid rgba(249,115,22,0.3)",
            boxShadow:
              streak > 0
                ? `0 0 ${Math.min(20 + streak * 2, 40)}px rgba(249,115,22,${glowOpacity * 1.6})`
                : "none",
          }}
        >
          <Flame
            size={30}
            className="text-orange-400"
            fill={streak > 0 ? "currentColor" : "none"}
          />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-400">Ma série</span>
            {multiplier > 1 && (
              <span className="text-[11px] font-bold text-[#F5C044] bg-[#F5C044]/10 px-1.5 py-0.5 rounded-full border border-[#F5C044]/20">
                ×{multiplier} XP
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{streak}</span>
            <span className="text-base text-slate-400">
              {streak === 1 ? "jour" : "jours"}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{getStreakMessage(streak)}</p>
        </div>

        <div className="hidden sm:flex flex-col items-center text-center flex-shrink-0">
          <Crown size={16} className="text-[#F5C044] mb-1" />
          <span className="text-xs font-semibold text-slate-400">{name}</span>
          <div className="mt-1">
            {todayValidated ? (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ✓ Validé
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                En cours
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Leaderboard row ─────────────────────────────────────────────────────────

function LeaderboardRow({
  rank,
  name,
  streak,
  totalMinutes,
  isMe,
  activeToday,
  ghost,
  sort,
  delay = 0,
}: {
  rank: number;
  name: string;
  streak: number;
  totalMinutes: number;
  isMe?: boolean;
  activeToday?: boolean;
  ghost?: boolean;
  sort: LeaderboardSort;
  delay?: number;
}) {
  const medal =
    rank === 1 ? "text-[#F5C044]" : rank === 2 ? "text-slate-400" : rank === 3 ? "text-amber-600" : "text-slate-600";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: ghost ? 0.35 : 1, x: 0 }}
      transition={{ delay }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
        isMe
          ? "bg-[#F5C044]/8 border-[#F5C044]/20"
          : "bg-white/[0.02] border-white/[0.04]"
      }`}
    >
      {/* Rank */}
      <div className={`w-7 text-sm font-bold text-center flex-shrink-0 ${medal}`}>
        {rank <= 3 ? <Medal size={16} className={`mx-auto ${medal}`} /> : rank}
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-semibold truncate ${
              isMe ? "text-[#F5C044]" : ghost ? "text-slate-600" : "text-white"
            }`}
          >
            {name}
          </span>
          {isMe && (
            <span className="text-[10px] text-[#F5C044]/60 bg-[#F5C044]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
              toi
            </span>
          )}
          {!ghost && activeToday && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              actif
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      {ghost ? (
        <div className="flex items-center gap-1 text-xs text-slate-600">
          <Lock size={11} />
          Inviter
        </div>
      ) : (
        <div className="flex items-center gap-4 text-xs tabular-nums">
          {sort === "streak" ? (
            <span
              className={`flex items-center gap-1 font-semibold ${isMe ? "text-orange-400" : "text-slate-400"}`}
            >
              <Flame size={12} />
              {streak}j
            </span>
          ) : (
            <span className={`flex items-center gap-1 font-semibold ${isMe ? "text-[#F5C044]" : "text-slate-400"}`}>
              <Clock size={12} />
              {formatDuration(totalMinutes)}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Invite section ───────────────────────────────────────────────────────────

function InviteSection() {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");

  function handleCopy() {
    const link =
      typeof window !== "undefined"
        ? `${window.location.origin}?invite=vidaris`
        : "https://vidaris.app?invite=...";
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center py-8 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/[0.06] flex items-center justify-center mb-4">
          <Users size={22} className="text-slate-500" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1.5">
          Aucun ami pour l'instant
        </h3>
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
          Invite tes amis pour comparer vos séries et vous motiver mutuellement.
        </p>
      </motion.div>

      {/* Copy link */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3"
      >
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Lien d'invitation
        </p>
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/[0.06] text-xs text-slate-500 font-mono truncate">
            {typeof window !== "undefined"
              ? `${window.location.origin}?invite=vidaris`
              : "vidaris.app?invite=..."}
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-lg bg-[#F5C044]/10 border border-[#F5C044]/20 text-[#F5C044] hover:bg-[#F5C044]/15 transition-colors flex items-center gap-1.5 text-xs font-semibold flex-shrink-0"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1"
                >
                  <Check size={13} />
                  Copié !
                </motion.span>
              ) : (
                <motion.span key="copy" className="flex items-center gap-1">
                  <Copy size={13} />
                  Copier
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      {/* Email invite */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3"
      >
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Inviter par email
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom@email.com"
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/[0.06] text-sm text-white placeholder-slate-600 outline-none focus:border-[#F5C044]/30 transition-colors"
          />
          <button className="px-3 py-2 rounded-lg bg-white/5 border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold flex-shrink-0">
            <UserPlus size={13} />
            Envoyer
          </button>
        </div>
        <p className="text-xs text-slate-600">
          La synchronisation en temps réel sera disponible prochainement.
        </p>
      </motion.div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SocialPage() {
  const sessions = useStudyStore((s) => s.sessions);
  const streakConfig = useStudyStore((s) => s.streakConfig);
  const user = useAuthStore((s) => s.user);

  const [tab, setTab] = useState<SocialTab>("classement");
  const [sort, setSort] = useState<LeaderboardSort>("streak");

  const streak = calculateStreak(sessions, streakConfig.minMinutes);
  const todayMinutes = getTotalMinutesForDate(sessions, getTodayKey());
  const totalMinutes = sessions.reduce((acc, s) => acc + Math.floor(s.duration / 60), 0);
  const name = user?.name ?? "Toi";

  // Placeholder friend slots — ghost rows that invite the user to invite friends
  const ghostFriends = [
    { name: "Ami 1", streak: 0, totalMinutes: 0 },
    { name: "Ami 2", streak: 0, totalMinutes: 0 },
    { name: "Ami 3", streak: 0, totalMinutes: 0 },
  ];

  return (
    <PageContainer maxWidth="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-white">Social</h2>
              <span className="text-[10px] font-bold text-[#F5C044]/70 bg-[#F5C044]/10 border border-[#F5C044]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Bêta
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">
              Compare ta série avec tes amis.
            </p>
          </div>
        </div>

        {/* My streak card */}
        <MyStreakCard
          name={name}
          streak={streak}
          todayMinutes={todayMinutes}
          minMinutes={streakConfig.minMinutes}
        />

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Flame, label: "Série actuelle", value: `${streak}j`, color: "#f97316" },
            { icon: Trophy, label: "Meilleur streak", value: `${streak}j`, color: "#F5C044" },
            { icon: Clock, label: "Temps total", value: formatDuration(totalMinutes), color: "#a78bfa" },
            { icon: Users, label: "Amis", value: "0", color: "#34d399" },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-[#111827] border border-white/[0.06] rounded-xl p-4 text-center"
            >
              <Icon size={16} className="mx-auto mb-2" style={{ color }} />
              <p className="text-lg font-bold text-white">{value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/[0.04] w-fit">
          {(["classement", "amis"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                tab === t
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {t === "classement" ? "Classement" : "Amis"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "classement" ? (
            <motion.div
              key="classement"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={15} className="text-[#F5C044]" />
                  <h3 className="text-sm font-semibold text-white">Classement</h3>
                </div>
                <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                  {(["streak", "temps"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSort(s as LeaderboardSort)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                        sort === s
                          ? "bg-white/10 text-white"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {s === "streak" ? "Série" : "Temps"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <LeaderboardRow
                  rank={1}
                  name={name}
                  streak={streak}
                  totalMinutes={totalMinutes}
                  isMe
                  activeToday={todayMinutes >= streakConfig.minMinutes}
                  sort={sort}
                  delay={0.05}
                />
                {ghostFriends.map((f, i) => (
                  <LeaderboardRow
                    key={f.name}
                    rank={i + 2}
                    name={f.name}
                    streak={f.streak}
                    totalMinutes={f.totalMinutes}
                    ghost
                    sort={sort}
                    delay={0.08 + i * 0.04}
                  />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center pt-2"
              >
                <p className="text-xs text-slate-600 mb-3">
                  Invite des amis pour un vrai classement
                </p>
                <button
                  onClick={() => setTab("amis")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5C044]/10 border border-[#F5C044]/20 text-[#F5C044] text-sm font-semibold hover:bg-[#F5C044]/15 transition-colors"
                >
                  <UserPlus size={14} />
                  Inviter des amis
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="amis"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5"
            >
              <InviteSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}
