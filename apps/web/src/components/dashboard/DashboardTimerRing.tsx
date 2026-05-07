"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Play, Pause, Timer, Coffee, RotateCcw, ArrowRight, Zap } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { formatTime, formatDuration } from "@/lib/utils";
import { getSubjectFromList } from "@/lib/subjects";
import { SubjectPickerModal } from "@/components/timer/SubjectPickerModal";

const DAILY_GOAL_SECONDS = 4 * 3600;
const RADIUS = 72;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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
  const setSubject = useStudyStore((s) => s.setSubject);
  const hardcoreMode = useStudyStore((s) => s.hardcoreMode);

  const subject = getSubjectFromList(subjects, selectedSubjectId);
  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isIdle = status === "idle";
  const isBreak = pomodoroPhase !== "work";

  let progressRatio = 0;
  let displayTime = "";
  let phaseLabel = "";

  if (mode === "chrono") {
    progressRatio = Math.min(elapsed / DAILY_GOAL_SECONDS, 1);
    displayTime = elapsed === 0 ? "00:00" : formatTime(elapsed);
    phaseLabel = "chrono";
  } else {
    const phaseTotal =
      pomodoroPhase === "work"
        ? pomodoroConfig.workDuration
        : pomodoroPhase === "shortBreak"
        ? pomodoroConfig.shortBreak
        : pomodoroConfig.longBreak;
    progressRatio = phaseTotal > 0 ? 1 - remaining / phaseTotal : 0;
    displayTime = formatTime(remaining > 0 ? remaining : pomodoroConfig.workDuration);
    phaseLabel = isBreak
      ? pomodoroPhase === "longBreak" ? "grande pause" : "pause"
      : "focus";
  }

  const dashOffset = CIRCUMFERENCE * (1 - progressRatio);
  const accentColor =
    hardcoreMode && isRunning && !isBreak
      ? "#ef4444"
      : mode === "chrono"
      ? "#F5C044"
      : isBreak
      ? "#2dd4bf"
      : subject?.color ?? "#F5C044";

  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const lastSubject = lastSession ? getSubjectFromList(subjects, lastSession.subjectId) : null;

  // Calcul progression journalière
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
    setSubject(subjectId);
    setShowPicker(false);
    startTimer();
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
              <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide px-1.5 py-0.5 bg-red-500/10 rounded-md">HC</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isRunning && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                En cours
              </span>
            )}
            {isPaused && (
              <span className="text-xs text-slate-500 font-medium">En pause</span>
            )}
            {/* Mode switch dans le header */}
            {!isRunning && (
              <div className="flex gap-0.5 p-0.5 bg-white/[0.04] rounded-lg border border-white/[0.05]">
                {(["pomodoro", "chrono"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleModeSwitch(m)}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
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

        {/* Corps : ring + info */}
        <div className="p-5">
          <div className="flex items-center gap-6">
            {/* Ring SVG */}
            <div className="relative flex-shrink-0">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-20 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
              />
              <svg width={168} height={168} viewBox="0 0 168 168" className="-rotate-90">
                <circle
                  cx={84} cy={84} r={RADIUS}
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={8}
                />
                <motion.circle
                  cx={84} cy={84} r={RADIUS}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{ filter: `drop-shadow(0 0 8px ${accentColor}90)` }}
                />
                <circle
                  cx={84} cy={84} r={RADIUS - 14}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={1}
                  strokeOpacity={0.07}
                />
              </svg>

              {/* Contenu du ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                {isBreak && isRunning && <Coffee size={14} className="text-[#2dd4bf]" />}
                <span
                  className="text-2xl font-bold tabular-nums leading-none"
                  style={{ color: isRunning ? accentColor : "white" }}
                >
                  {displayTime}
                </span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">{phaseLabel}</span>
              </div>
            </div>

            {/* Infos + CTA */}
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              {/* Matière active */}
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: subject?.color ?? "#64748b",
                    boxShadow: subject?.color ? `0 0 8px ${subject.color}80` : "none",
                  }}
                />
                <span className="text-base font-semibold text-white truncate">
                  {subject?.label ?? "Aucune matière sélectionnée"}
                </span>
              </div>

              {isRunning && mode === "pomodoro" && !isBreak && (
                <p className="text-sm text-slate-500">
                  {Math.floor(remaining / 60)} min restantes · focus
                </p>
              )}
              {isRunning && mode === "chrono" && (
                <p className="text-sm text-slate-500">Chrono en cours</p>
              )}

              {/* Progression journalière */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Aujourd&apos;hui</span>
                  <span className="text-white font-medium">
                    {formatDuration(Math.floor(todaySeconds / 60))} / 4h
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${todayPct}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}50` }}
                  />
                </div>
              </div>

              {/* Bouton principal */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLaunch}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isRunning
                    ? "bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08]"
                    : hardcoreMode
                    ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/25"
                    : "bg-[#F5C044] text-[#0B0F1A] shadow-[0_0_16px_rgba(245,192,68,0.25)] hover:shadow-[0_0_24px_rgba(245,192,68,0.4)] hover:bg-[#f7cb6a]"
                }`}
              >
                {isRunning ? (
                  <><Pause size={14} /> Gérer le timer</>
                ) : isPaused ? (
                  <><Play size={14} fill="currentColor" /> Reprendre</>
                ) : (
                  <><Play size={14} fill="currentColor" /> Lancer une session</>
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
          </div>
        </div>

        {/* Barre de statut en bas */}
        {isRunning && (
          <div
            className="h-0.5 w-full"
            style={{ background: `linear-gradient(90deg, ${accentColor}80, ${accentColor}20)` }}
          />
        )}
      </motion.div>
    </>
  );
}
