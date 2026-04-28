"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Play, Pause, Timer, Coffee, RotateCcw } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { formatTime, formatDuration } from "@/lib/utils";
import { getSubjectFromList } from "@/lib/subjects";

const DAILY_GOAL_SECONDS = 4 * 3600;
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DashboardTimerRing() {
  const router = useRouter();
  const mode = useStudyStore((s) => s.mode);
  const setMode = useStudyStore((s) => s.setMode);
  const status = useStudyStore((s) => s.status);
  const elapsed = useStudyStore((s) => s.elapsed);
  const remaining = useStudyStore((s) => s.remaining);
  const selectedSubjectId = useStudyStore((s) => s.selectedSubjectId);
  const subjects = useStudyStore((s) => s.subjects);
  const pomodoroConfig = useStudyStore((s) => s.pomodoroConfig);
  const pomodoroPhase = useStudyStore((s) => s.pomodoroPhase);
  const sessions = useStudyStore((s) => s.sessions);
  const startTimer = useStudyStore((s) => s.startTimer);
  const hardcoreMode = useStudyStore((s) => s.hardcoreMode);

  const subject = getSubjectFromList(subjects, selectedSubjectId);
  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isIdle = status === "idle";
  const isBreak = pomodoroPhase !== "work";

  // Progress ring
  let progressRatio = 0;
  let displayTime = "";

  if (mode === "chrono") {
    progressRatio = Math.min(elapsed / DAILY_GOAL_SECONDS, 1);
    displayTime = elapsed === 0 ? "00:00" : formatTime(elapsed);
  } else {
    const phaseTotal =
      pomodoroPhase === "work"
        ? pomodoroConfig.workDuration
        : pomodoroPhase === "shortBreak"
        ? pomodoroConfig.shortBreak
        : pomodoroConfig.longBreak;
    progressRatio = phaseTotal > 0 ? 1 - remaining / phaseTotal : 0;
    displayTime = formatTime(remaining > 0 ? remaining : pomodoroConfig.workDuration);
  }

  const dashOffset = CIRCUMFERENCE * (1 - progressRatio);
  const accentColor =
    hardcoreMode && isRunning && !isBreak
      ? "#ef4444"
      : mode === "chrono"
      ? "#F5C044"
      : isBreak
      ? "#2dd4bf"
      : subject.color;

  // Last session for quick restart
  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const lastSubject = lastSession
    ? getSubjectFromList(subjects, lastSession.subjectId)
    : null;

  function handleMainClick() {
    if (isIdle) startTimer();
    router.push("/timer");
  }

  function handleRelaunch() {
    router.push("/timer");
  }

  function handleModeSwitch(m: "pomodoro" | "chrono") {
    if (isRunning) return;
    setMode(m);
  }

  const statusLabel = isRunning
    ? isBreak ? "pause" : "focus"
    : isPaused ? "en pause"
    : mode === "pomodoro" ? "prêt"
    : "prêt";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={`rounded-2xl p-4 flex flex-col border transition-colors ${
        hardcoreMode && isRunning
          ? "bg-[#1a0f0f] border-red-500/15"
          : "bg-[#111827] border-white/[0.06]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer
            size={13}
            className={hardcoreMode && isRunning ? "text-red-400" : "text-slate-400"}
          />
          <h3 className="text-sm font-semibold text-white">Timer</h3>
          {hardcoreMode && (
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide px-1.5 py-0.5 bg-red-500/10 rounded-md">
              HC
            </span>
          )}
        </div>
        {isRunning && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En cours
          </span>
        )}
        {isPaused && (
          <span className="text-[11px] text-slate-500 font-medium">En pause</span>
        )}
      </div>

      {/* Mode switch — visible seulement si pas en cours */}
      {!isRunning && (
        <div className="flex gap-0.5 p-0.5 bg-white/[0.04] rounded-xl border border-white/[0.06] mb-3">
          {(["pomodoro", "chrono"] as const).map((m) => (
            <button
              key={m}
              onClick={() => handleModeSwitch(m)}
              disabled={isRunning}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                mode === m
                  ? "bg-[#F5C044] text-[#0B0F1A]"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {m === "pomodoro" ? "Pomodoro" : "Chrono"}
            </button>
          ))}
        </div>
      )}

      {/* Ring + Info */}
      <div
        className="flex items-center gap-4 cursor-pointer group"
        onClick={handleMainClick}
      >
        {/* Ring */}
        <div className="relative flex-shrink-0">
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-25 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
          />
          <svg width={120} height={120} viewBox="0 0 120 120" className="-rotate-90">
            <circle
              cx={60} cy={60} r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={7}
            />
            <motion.circle
              cx={60} cy={60} r={RADIUS}
              fill="none"
              stroke={accentColor}
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 6px ${accentColor}80)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            {isBreak && isRunning && (
              <Coffee size={13} className="text-[#2dd4bf]" />
            )}
            <span
              className="text-lg font-bold tabular-nums leading-none"
              style={{ color: isRunning ? accentColor : "white" }}
            >
              {displayTime}
            </span>
            <span className="text-[8px] text-slate-500 uppercase tracking-widest">
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-2.5 flex-1 min-w-0">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: subject.color }}
              />
              <span className="text-sm font-semibold text-white truncate">
                {subject.label}
              </span>
            </div>
            {mode === "pomodoro" && isRunning && !isBreak && (
              <p className="text-[11px] text-slate-500 pl-3.5">
                {Math.floor(remaining / 60)}min restantes
              </p>
            )}
            {mode === "chrono" && isRunning && (
              <p className="text-[11px] text-slate-500 pl-3.5">
                chrono en cours
              </p>
            )}
          </div>

          {/* CTA */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isRunning
                ? "bg-white/[0.05] border border-white/[0.08] text-slate-300"
                : hardcoreMode
                ? "bg-red-500/20 border border-red-500/30 text-red-400 group-hover:bg-red-500/25"
                : "bg-[#F5C044] text-[#0B0F1A] shadow-[0_0_10px_rgba(245,192,68,0.2)] group-hover:shadow-[0_0_16px_rgba(245,192,68,0.35)]"
            }`}
          >
            {isRunning ? (
              <><Pause size={11} /> Gérer</>
            ) : isPaused ? (
              <><Play size={11} fill="currentColor" /> Reprendre</>
            ) : (
              <><Play size={11} fill="currentColor" /> Lancer</>
            )}
          </motion.div>
        </div>
      </div>

      {/* Last session quick restart */}
      {lastSession && lastSubject && !isRunning && (
        <div className="mt-3 pt-3 border-t border-white/[0.05]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: lastSubject.color }}
              />
              <span className="text-[11px] text-slate-500 truncate">
                <span className="text-slate-400 font-medium">{lastSubject.label}</span>
                {" "}
                {formatDuration(Math.floor(lastSession.duration / 60))}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleRelaunch(); }}
              className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-[#F5C044] transition-colors flex-shrink-0"
            >
              <RotateCcw size={9} />
              Relancer
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
