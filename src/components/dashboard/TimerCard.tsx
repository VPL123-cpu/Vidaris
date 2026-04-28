"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { formatTime, getTotalMinutesForDate, getTodayKey } from "@/lib/utils";
import { GlowButton } from "@/components/ui/GlowButton";
import { SubjectSelector } from "./SubjectSelector";
import { getSubjectFromList } from "@/lib/subjects";

const DAILY_GOAL_MINUTES = 240;

function ModeToggle() {
  const mode = useStudyStore((s) => s.mode);
  const setMode = useStudyStore((s) => s.setMode);
  const status = useStudyStore((s) => s.status);

  return (
    <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/[0.06]">
      {(["pomodoro", "chrono"] as const).map((m) => (
        <button
          key={m}
          onClick={() => status === "idle" && setMode(m)}
          disabled={status !== "idle"}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 capitalize ${
            mode === m
              ? "bg-white/10 text-white"
              : "text-slate-500 hover:text-slate-300"
          } disabled:cursor-not-allowed`}
        >
          {m === "pomodoro" ? "Pomodoro" : "Chrono"}
        </button>
      ))}
    </div>
  );
}

export function TimerCard() {
  const { mode, status, remaining, elapsed, pomodoroPhase, sessions } = useStudyStore();
  const startTimer = useStudyStore((s) => s.startTimer);
  const pauseTimer = useStudyStore((s) => s.pauseTimer);
  const resetTimer = useStudyStore((s) => s.resetTimer);
  const tick = useStudyStore((s) => s.tick);
  const selectedSubjectId = useStudyStore((s) => s.selectedSubjectId);
  const subjects = useStudyStore((s) => s.subjects);

  const subject = getSubjectFromList(subjects, selectedSubjectId);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const todayMinutes = getTotalMinutesForDate(sessions, getTodayKey());
  const todayElapsed = Math.floor(elapsed / 60);
  const todayTotal = todayMinutes + (status === "running" ? todayElapsed : 0);

  const runInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => tick(), 1000);
  }, [tick]);

  useEffect(() => {
    if (status === "running") {
      runInterval();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, runInterval]);

  const isRunning = status === "running";
  const isBreak = pomodoroPhase === "shortBreak" || pomodoroPhase === "longBreak";

  const handleToggle = () => {
    if (isRunning) pauseTimer();
    else startTimer();
  };

  // Circle progress for pomodoro
  const RADIUS = 90;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const totalTime = mode === "pomodoro" ? (isBreak ? 600 : 3000) : 14400;
  const progressRatio = 1 - remaining / totalTime;
  const dashOffset = CIRCUMFERENCE * (1 - progressRatio);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-[#111827] rounded-2xl border border-white/[0.06] p-6 space-y-6"
    >
      {/* Daily progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400 font-medium">
          <span className="text-white font-bold">{todayTotal}min</span> sur {DAILY_GOAL_MINUTES / 60}h
        </span>
        <AnimatePresence mode="wait">
          {isBreak ? (
            <motion.div
              key="break"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex items-center gap-1.5 text-[#2dd4bf] font-medium"
            >
              <Coffee size={14} />
              <span>Pause méritée</span>
            </motion.div>
          ) : (
            <motion.div
              key="subject"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex items-center gap-1.5"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: subject.color }}
              />
              <span className="text-slate-400">{subject.label}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timer Ring */}
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="relative flex items-center justify-center">
          <svg
            width={220}
            height={220}
            viewBox="0 0 220 220"
            className="-rotate-90"
          >
            {/* Track */}
            <circle
              cx={110}
              cy={110}
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={8}
            />
            {/* Progress */}
            <motion.circle
              cx={110}
              cy={110}
              r={RADIUS}
              fill="none"
              stroke={isBreak ? "#2dd4bf" : subject.color}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{
                filter: `drop-shadow(0 0 8px ${isBreak ? "#2dd4bf" : subject.color})`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute flex flex-col items-center">
            <motion.span
              className={`text-5xl font-bold tracking-tight ${
                isRunning ? "timer-running" : ""
              } ${isBreak ? "text-[#2dd4bf]" : "text-white"}`}
            >
              {formatTime(remaining)}
            </motion.span>
            <span className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">
              {mode === "pomodoro"
                ? isBreak
                  ? "pause"
                  : "concentration"
                : "chrono"}
            </span>
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <ModeToggle />

      {/* Subject selector */}
      <SubjectSelector />

      {/* Controls */}
      <div className="flex gap-3">
        <GlowButton
          variant="gold"
          size="lg"
          onClick={handleToggle}
          className="flex-1"
        >
          {isRunning ? (
            <>
              <Pause size={20} strokeWidth={2.5} />
              Pause
            </>
          ) : (
            <>
              <Play size={20} strokeWidth={2.5} fill="currentColor" />
              {status === "paused" ? "Reprendre" : "Démarrer"}
            </>
          )}
        </GlowButton>

        {status !== "idle" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={resetTimer}
            className="p-4 rounded-2xl bg-white/5 border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <RotateCcw size={20} />
          </motion.button>
        )}
      </div>

      {/* Pomodoro cycle indicator */}
      {mode === "pomodoro" && (
        <PomoCycles />
      )}
    </motion.div>
  );
}

function PomoCycles() {
  const cycles = useStudyStore((s) => s.pomoCyclesCompleted);
  const MAX = 4;

  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-xs text-slate-500 font-medium">Cycles</span>
      <div className="flex gap-1.5">
        {Array.from({ length: MAX }, (_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i < cycles % MAX
                ? "bg-[#F5C044] shadow-[0_0_6px_rgba(245,192,68,0.6)]"
                : "bg-white/10"
            }`}
          />
        ))}
      </div>
      {cycles > 0 && (
        <span className="text-xs text-slate-500">
          {cycles} total
        </span>
      )}
    </div>
  );
}
