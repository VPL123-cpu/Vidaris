"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Zap, Flame } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { formatTime, getTotalMinutesForDate, getTodayKey, formatDuration } from "@/lib/utils";
import { GlowButton } from "@/components/ui/GlowButton";
import { SubjectPickerModal } from "@/components/timer/SubjectPickerModal";
import { getSubjectFromList } from "@/lib/subjects";

const DAILY_GOAL_SECONDS = 4 * 3600;

function ModeToggle() {
  const mode = useStudyStore((s) => s.mode);
  const setMode = useStudyStore((s) => s.setMode);
  const status = useStudyStore((s) => s.status);
  const disabled = status !== "idle";

  return (
    <div className="flex gap-1 p-1 bg-white/[0.04] rounded-2xl border border-white/[0.07]">
      {(["pomodoro", "chrono"] as const).map((m) => (
        <button
          key={m}
          onClick={() => !disabled && setMode(m)}
          disabled={disabled}
          className={`flex-1 py-2 px-5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            mode === m ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
          } disabled:cursor-not-allowed`}
        >
          {m === "pomodoro" ? "Pomodoro" : "Chrono libre"}
        </button>
      ))}
    </div>
  );
}

function PomoCycles() {
  const cycles = useStudyStore((s) => s.pomoCyclesCompleted);
  const maxCycles = useStudyStore((s) => s.pomodoroConfig.cyclesBeforeLongBreak);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 font-medium">Cycles</span>
      <div className="flex gap-1.5">
        {Array.from({ length: maxCycles }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i < cycles % maxCycles
                ? "bg-[#F5C044] shadow-[0_0_6px_rgba(245,192,68,0.7)]"
                : "bg-white/10"
            }`}
          />
        ))}
      </div>
      {cycles > 0 && <span className="text-xs text-slate-600">{cycles} total</span>}
    </div>
  );
}

export function TimerPage() {
  const [showPicker, setShowPicker] = useState(false);

  const {
    mode, status, remaining, elapsed,
    pomodoroPhase, sessions, selectedSubjectId, subjects, pomodoroConfig, hardcoreMode,
  } = useStudyStore();
  const startTimer = useStudyStore((s) => s.startTimer);
  const pauseTimer = useStudyStore((s) => s.pauseTimer);
  const resetTimer = useStudyStore((s) => s.resetTimer);

  const subject = getSubjectFromList(subjects, selectedSubjectId);
  const subjectColor = subject?.color ?? "#64748b";
  const subjectLabel = subject?.label ?? "Aucune matière";
  const todayMinutes = getTotalMinutesForDate(sessions, getTodayKey());
  const todayTotal = todayMinutes + (status === "running" ? Math.floor(elapsed / 60) : 0);
  const isRunning = status === "running";
  const isIdle = status === "idle";
  const isBreak = pomodoroPhase !== "work";

  const RADIUS = 110;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  let progressRatio = 0;
  let displayTime = "00:00";
  let phaseName = "";

  if (mode === "chrono") {
    progressRatio = Math.min(elapsed / DAILY_GOAL_SECONDS, 1);
    displayTime = formatTime(elapsed);
    phaseName = "chrono";
  } else {
    const phaseTotal =
      pomodoroPhase === "work"
        ? pomodoroConfig.workDuration
        : pomodoroPhase === "shortBreak"
        ? pomodoroConfig.shortBreak
        : pomodoroConfig.longBreak;
    progressRatio = phaseTotal > 0 ? 1 - remaining / phaseTotal : 0;
    displayTime = formatTime(remaining);
    phaseName = isBreak
      ? pomodoroPhase === "longBreak"
        ? "grande pause"
        : "pause"
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
      : subjectColor;

  const dailyGoalMinutes = Math.floor(DAILY_GOAL_SECONDS / 60);
  const canReset = status !== "idle" && !(hardcoreMode && isRunning);

  function handleStart() {
    if (isRunning) {
      pauseTimer();
      return;
    }
    if (status === "paused") {
      startTimer();
      return;
    }
    // idle → ouvrir le picker de matière
    setShowPicker(true);
  }

  function handlePickerSelect(subjectId: string) {
    setShowPicker(false);
    startTimer(subjectId);
  }

  const svgSize = 260;
  const center = svgSize / 2;

  return (
    <>
      <SubjectPickerModal
        open={showPicker}
        onSelect={handlePickerSelect}
        onClose={() => setShowPicker(false)}
      />

      <div className="space-y-4">
        {hardcoreMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <Flame size={13} className="text-red-400" fill="currentColor" />
            <span className="text-xs font-semibold text-red-400">Mode Hardcore actif — pas de raccourcis</span>
          </motion.div>
        )}

        <ModeToggle />

        {/* Timer ring */}
        <div className="relative flex flex-col items-center py-2">
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-8 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
          />

          <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="-rotate-90">
            <circle
              cx={center} cy={center} r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={9}
            />
            <motion.circle
              cx={center} cy={center} r={RADIUS}
              fill="none"
              stroke={accentColor}
              strokeWidth={9}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 10px ${accentColor}80)` }}
            />
            <circle
              cx={center} cy={center} r={RADIUS - 16}
              fill="none"
              stroke={accentColor}
              strokeWidth={1}
              strokeOpacity={0.08}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            <AnimatePresence mode="wait">
              {mode === "chrono" ? (
                <motion.div
                  key="chrono-label"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: subjectColor, boxShadow: `0 0 6px ${subjectColor}` }}
                  />
                  <span className="text-xs font-medium text-slate-400">{subjectLabel}</span>
                </motion.div>
              ) : isBreak ? (
                <motion.div
                  key="break"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-1"
                >
                  <Coffee size={18} className="text-[#2dd4bf]" />
                  <span className="text-xs font-semibold text-[#2dd4bf] uppercase tracking-widest">
                    {pomodoroPhase === "longBreak" ? "Grande pause" : "Pause"}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="work"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: subjectColor, boxShadow: `0 0 6px ${subjectColor}` }}
                  />
                  <span className="text-xs font-medium text-slate-400">{subjectLabel}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.span
              className="text-5xl font-bold tracking-tighter tabular-nums"
              style={{
                color:
                  hardcoreMode && isRunning && !isBreak
                    ? "#ef4444"
                    : mode === "chrono"
                    ? "#F5C044"
                    : isBreak
                    ? "#2dd4bf"
                    : "white",
              }}
            >
              {displayTime}
            </motion.span>

            <span className="text-[10px] text-slate-600 uppercase tracking-widest">{phaseName}</span>
          </div>
        </div>

        {/* Daily progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Aujourd&apos;hui</span>
            <span>
              <span className="text-white font-semibold">{formatDuration(todayTotal)}</span>
              {" / "}
              {formatDuration(dailyGoalMinutes)}
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${Math.min((todayTotal / dailyGoalMinutes) * 100, 100)}%` }}
              transition={{ duration: 0.6 }}
              className={`h-full rounded-full bg-gradient-to-r ${
                hardcoreMode ? "from-red-500 to-orange-400" : "from-[#F5C044] to-[#f7cb6a]"
              }`}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <GlowButton
            variant={hardcoreMode && isRunning && !isBreak ? "outline" : "gold"}
            size="lg"
            onClick={handleStart}
            className={`flex-1 text-lg ${
              hardcoreMode && isRunning && !isBreak
                ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                : ""
            }`}
          >
            {isRunning ? (
              <><Pause size={20} strokeWidth={2.5} /> Pause</>
            ) : (
              <><Play size={20} strokeWidth={2.5} fill="currentColor" />
                {status === "paused" ? "Reprendre" : "Démarrer"}
              </>
            )}
          </GlowButton>

          <AnimatePresence>
            {canReset && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.8, width: 0 }}
                onClick={resetTimer}
                className="px-4 rounded-2xl bg-white/5 border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <RotateCcw size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between">
          {mode === "pomodoro" ? (
            <PomoCycles />
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Zap size={10} className="text-[#F5C044]/50" />
            <span>2 XP / min</span>
          </div>
        </div>
      </div>
    </>
  );
}
