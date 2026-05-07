"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Play, Pause, Timer, Coffee, RotateCcw, ArrowRight, Zap } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { formatTime, formatDuration } from "@/lib/utils";
import { getSubjectFromList } from "@/lib/subjects";
import { SubjectPickerModal } from "@/components/timer/SubjectPickerModal";

const DAILY_GOAL_SECONDS = 4 * 3600;

export function DashboardTimerRing() {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);

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
  const isBreak = pomodoroPhase !== "work";

  let displayTime = "";
  let phaseLabel = "";

  if (mode === "chrono") {
    displayTime = formatTime(elapsed);
    phaseLabel = "chrono";
  } else {
    displayTime = formatTime(remaining > 0 ? remaining : pomodoroConfig.workDuration);
    phaseLabel = isBreak
      ? pomodoroPhase === "longBreak" ? "grande pause" : "pause"
      : "focus";
  }

  const accentColor =
    hardcoreMode && isRunning && !isBreak
      ? "#ef4444"
      : mode === "chrono"
      ? "#F5C044"
      : isBreak
      ? "#2dd4bf"
      : subject?.color ?? "#F5C044";

  // Dernière session avec durée > 0
  const lastSession = [...sessions].reverse().find((s) => s.duration > 0) ?? null;
  const lastSubject = lastSession ? getSubjectFromList(subjects, lastSession.subjectId) : null;

  const todayKey = new Date().toISOString().split("T")[0];
  const todaySessions = sessions.filter((s) => s.date === todayKey);
  const todaySeconds = todaySessions.reduce((acc, s) => acc + s.duration, 0) + (isRunning ? elapsed : 0);
  const todayPct = Math.min((todaySeconds / DAILY_GOAL_SECONDS) * 100, 100);

  function handleLaunch() {
    if (isRunning || isPaused) {
      router.push("/timer");
      return;
    }
    setShowPicker(true);
  }

  function handlePickerSelect(subjectId: string) {
    setShowPicker(false);
    startTimer(subjectId);
  }

  function handleModeSwitch(m: "pomodoro" | "chrono") {
    if (isRunning) return;
    setMode(m);
  }

  return (
    <>
      <SubjectPickerModal
        open={showPicker}
        onSelect={handlePickerSelect}
        onClose={() => setShowPicker(false)}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl border transition-colors overflow-hidden ${
          hardcoreMode && isRunning
            ? "bg-[#1a0f0f] border-red-500/15"
            : "bg-[#111827] border-white/[0.06]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Timer
              size={14}
              className={hardcoreMode && isRunning ? "text-red-400" : "text-[#F5C044]"}
            />
            <h3 className="text-sm font-semibold text-white">Timer</h3>
            {hardcoreMode && (
              <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide px-1.5 py-0.5 bg-red-500/10 rounded-md">
                HC
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {isRunning && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                En cours
              </span>
            )}
            {isPaused && (
              <span className="text-xs text-slate-500 font-medium">En pause</span>
            )}
            {!isRunning && (
              <div className="flex gap-0.5 p-0.5 bg-white/[0.04] rounded-lg border border-white/[0.05]">
                {(["pomodoro", "chrono"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleModeSwitch(m)}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                      mode === m ? "bg-[#F5C044] text-[#0B0F1A]" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {m === "pomodoro" ? "Pomo" : "Chrono"}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => router.push("/timer")}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              Ouvrir <ArrowRight size={11} />
            </button>
          </div>
        </div>

        {/* Corps */}
        <div className="p-5 space-y-4">
          {/* Matière + temps en cours */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: subject?.color ?? "#64748b",
                  boxShadow: subject?.color ? `0 0 6px ${subject.color}80` : "none",
                }}
              />
              <span className="text-sm font-semibold text-white truncate">
                {subject?.label ?? "Aucune matière"}
              </span>
            </div>

            {/* Temps affiché comme badge quand actif */}
            {(isRunning || isPaused) && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isBreak && <Coffee size={12} className="text-[#2dd4bf]" />}
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: accentColor }}
                >
                  {displayTime}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {phaseLabel}
                </span>
              </div>
            )}
          </div>

          {/* Info phase pomodoro */}
          {isRunning && mode === "pomodoro" && !isBreak && (
            <p className="text-xs text-slate-500 -mt-1">
              {Math.floor(remaining / 60)} min restantes · focus
            </p>
          )}
          {isRunning && mode === "chrono" && (
            <p className="text-xs text-slate-500 -mt-1 flex items-center gap-1">
              <Zap size={10} className="text-[#F5C044]/60" />
              2 XP / min
            </p>
          )}

          {/* Progression journalière */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Aujourd&apos;hui</span>
              <span className="font-medium" style={{ color: todayPct >= 100 ? "#34d399" : "white" }}>
                {formatDuration(Math.floor(todaySeconds / 60))}
                <span className="text-slate-600"> / 4h</span>
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${todayPct}%` }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: todayPct > 0 ? `0 0 8px ${accentColor}50` : "none",
                }}
              />
            </div>
          </div>

          {/* Bouton principal */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLaunch}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              isRunning
                ? "bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08]"
                : hardcoreMode
                ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/25"
                : "bg-[#F5C044] text-[#0B0F1A] shadow-[0_0_16px_rgba(245,192,68,0.2)] hover:bg-[#f7cb6a]"
            }`}
          >
            {isRunning ? (
              <><Pause size={14} /> Gérer</>
            ) : isPaused ? (
              <><Play size={14} fill="currentColor" /> Reprendre</>
            ) : (
              <><Play size={14} fill="currentColor" /> Lancer</>
            )}
          </motion.button>

          {/* Dernière session */}
          {lastSession && lastSubject && !isRunning && (
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 min-w-0 text-slate-600">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: lastSubject.color }}
                />
                <span className="truncate">
                  {lastSubject.label} · {formatDuration(Math.floor(lastSession.duration / 60))}
                </span>
              </div>
              <button
                onClick={() => router.push("/timer")}
                className="flex items-center gap-1 text-slate-600 hover:text-[#F5C044] transition-colors flex-shrink-0"
              >
                <RotateCcw size={9} /> Relancer
              </button>
            </div>
          )}
        </div>

        {/* Barre de statut */}
        {isRunning && (
          <div
            className="h-0.5 w-full"
            style={{ background: `linear-gradient(90deg, ${accentColor}80, ${accentColor}10)` }}
          />
        )}
      </motion.div>
    </>
  );
}
