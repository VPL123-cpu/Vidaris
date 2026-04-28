"use client";

import { create } from "zustand";
import { StudySession, PomodoroConfig, TimerMode, TimerStatus, Subject } from "@/types";
import { INITIAL_SESSIONS } from "@/lib/data";
import { DEFAULT_SUBJECTS, hexToRgba } from "@/lib/subjects";
import { generateId, getTodayKey } from "@/lib/utils";

const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  workDuration: 50 * 60,
  shortBreak: 10 * 60,
  longBreak: 30 * 60,
  cyclesBeforeLongBreak: 4,
};

type PomodoroPhase = "work" | "shortBreak" | "longBreak";

interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  elapsed: number;
  remaining: number;
  pomodoroPhase: PomodoroPhase;
  pomoCyclesCompleted: number;
  selectedSubjectId: string;
  currentSessionStart: number | null;
  // Timestamp-based persistence — survives navigation & refresh
  timerStartedAt: number | null;
  elapsedAtStart: number;
  remainingAtStart: number;
}

export interface StreakConfig {
  minMinutes: number;
  enabled: boolean;
}

const DEFAULT_STREAK_CONFIG: StreakConfig = { minMinutes: 30, enabled: true };

interface StudyStore extends TimerState {
  sessions: StudySession[];
  subjects: Subject[];
  pomodoroConfig: PomodoroConfig;
  streakConfig: StreakConfig;
  hardcoreMode: boolean;
  userId: string | null;

  setMode: (mode: TimerMode) => void;
  setSubject: (subjectId: string) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;

  addSession: (session: Omit<StudySession, "id">) => void;
  deleteSession: (id: string) => void;
  clearSessions: () => void;

  addSubject: (subject: Omit<Subject, "id">) => void;
  updateSubject: (id: string, patch: Partial<Omit<Subject, "id">>) => void;
  deleteSubject: (id: string) => void;

  updatePomodoroConfig: (patch: Partial<PomodoroConfig>) => void;
  updateStreakConfig: (patch: Partial<StreakConfig>) => void;
  toggleHardcoreMode: () => void;

  loadForUser: (userId: string | null) => void;
  saveToStorage: () => void;
}

function storageKey(userId: string | null): string {
  return userId ? `vidaris-study-${userId}` : "vidaris-study-guest";
}

function loadFromStorage(userId: string | null): Partial<StudyStore> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveToStorageRaw(userId: string | null, data: object): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId), JSON.stringify(data));
}

export const useStudyStore = create<StudyStore>()((set, get) => ({
  mode: "pomodoro",
  status: "idle",
  elapsed: 0,
  remaining: DEFAULT_POMODORO_CONFIG.workDuration,
  pomodoroPhase: "work",
  pomoCyclesCompleted: 0,
  selectedSubjectId: DEFAULT_SUBJECTS[0].id,
  currentSessionStart: null,
  timerStartedAt: null,
  elapsedAtStart: 0,
  remainingAtStart: DEFAULT_POMODORO_CONFIG.workDuration,

  sessions: INITIAL_SESSIONS,
  subjects: DEFAULT_SUBJECTS,
  pomodoroConfig: DEFAULT_POMODORO_CONFIG,
  streakConfig: DEFAULT_STREAK_CONFIG,
  hardcoreMode: false,
  userId: null,

  setMode: (mode) => {
    const { pomodoroConfig } = get();
    const remaining = mode === "pomodoro" ? pomodoroConfig.workDuration : 0;
    set({
      mode,
      remaining,
      elapsed: 0,
      status: "idle",
      pomodoroPhase: "work",
      timerStartedAt: null,
      elapsedAtStart: 0,
      remainingAtStart: remaining,
    });
  },

  setSubject: (subjectId) => set({ selectedSubjectId: subjectId }),

  startTimer: () => {
    const { elapsed, remaining } = get();
    const now = Date.now();
    set({
      status: "running",
      currentSessionStart: now,
      timerStartedAt: now,
      elapsedAtStart: elapsed,
      remainingAtStart: remaining,
    });
    get().saveToStorage();
  },

  pauseTimer: () => {
    const { elapsed, selectedSubjectId, mode, currentSessionStart } = get();
    if (elapsed > 0 && currentSessionStart) {
      get().addSession({
        subjectId: selectedSubjectId,
        duration: elapsed,
        date: getTodayKey(),
        mode,
        createdAt: currentSessionStart,
      });
    }
    set({ status: "paused", currentSessionStart: null, timerStartedAt: null });
    get().saveToStorage();
  },

  resetTimer: () => {
    const { mode, pomodoroConfig } = get();
    const remaining = mode === "pomodoro" ? pomodoroConfig.workDuration : 0;
    set({
      status: "idle",
      elapsed: 0,
      remaining,
      pomodoroPhase: "work",
      currentSessionStart: null,
      timerStartedAt: null,
      elapsedAtStart: 0,
      remainingAtStart: remaining,
    });
    get().saveToStorage();
  },

  // Timestamp-aware tick — always accurate regardless of setInterval drift or page absence
  tick: () => {
    const {
      mode, status, timerStartedAt, elapsedAtStart, remainingAtStart,
      pomodoroPhase, pomoCyclesCompleted,
      selectedSubjectId, currentSessionStart, pomodoroConfig,
    } = get();
    if (status !== "running" || !timerStartedAt) return;

    const secondsPassed = Math.floor((Date.now() - timerStartedAt) / 1000);

    if (mode === "chrono") {
      set({ elapsed: elapsedAtStart + secondsPassed });
      return;
    }

    const newRemaining = Math.max(0, remainingAtStart - secondsPassed);
    const newElapsed = elapsedAtStart + secondsPassed;

    if (newRemaining > 0) {
      set({ remaining: newRemaining, elapsed: newElapsed });
      return;
    }

    // Phase ended — guard against double-transition
    if (get().remaining === 0 && get().elapsed > 0) return;

    if (pomodoroPhase === "work") {
      if (currentSessionStart) {
        get().addSession({
          subjectId: selectedSubjectId,
          duration: pomodoroConfig.workDuration,
          date: getTodayKey(),
          mode: "pomodoro",
          createdAt: currentSessionStart,
        });
      }
      const newCycles = pomoCyclesCompleted + 1;
      const isLongBreak = newCycles % pomodoroConfig.cyclesBeforeLongBreak === 0;
      const nextRemaining = isLongBreak
        ? pomodoroConfig.longBreak
        : pomodoroConfig.shortBreak;
      const now = Date.now();
      set({
        pomodoroPhase: isLongBreak ? "longBreak" : "shortBreak",
        remaining: nextRemaining,
        elapsed: 0,
        pomoCyclesCompleted: newCycles,
        currentSessionStart: now,
        timerStartedAt: now,
        elapsedAtStart: 0,
        remainingAtStart: nextRemaining,
      });
    } else {
      set({
        pomodoroPhase: "work",
        remaining: pomodoroConfig.workDuration,
        elapsed: 0,
        status: "idle",
        currentSessionStart: null,
        timerStartedAt: null,
        elapsedAtStart: 0,
        remainingAtStart: pomodoroConfig.workDuration,
      });
    }
    get().saveToStorage();
  },

  addSession: (session) => {
    set((s) => ({ sessions: [...s.sessions, { ...session, id: generateId() }] }));
    get().saveToStorage();
  },

  deleteSession: (id) => {
    set((s) => ({ sessions: s.sessions.filter((sess) => sess.id !== id) }));
    get().saveToStorage();
  },

  clearSessions: () => {
    set({ sessions: [] });
    get().saveToStorage();
  },

  addSubject: (subject) => {
    const newSubject: Subject = { ...subject, id: generateId() };
    set((s) => ({ subjects: [...s.subjects, newSubject] }));
    get().saveToStorage();
  },

  updateSubject: (id, patch) => {
    set((s) => ({
      subjects: s.subjects.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              ...patch,
              bgColor: patch.color ? hexToRgba(patch.color, 0.15) : sub.bgColor,
            }
          : sub
      ),
    }));
    get().saveToStorage();
  },

  deleteSubject: (id) => {
    const { subjects, selectedSubjectId } = get();
    const remaining = subjects.filter((s) => s.id !== id);
    set({
      subjects: remaining,
      selectedSubjectId:
        selectedSubjectId === id ? (remaining[0]?.id ?? "") : selectedSubjectId,
    });
    get().saveToStorage();
  },

  updatePomodoroConfig: (patch) => {
    const newConfig = { ...get().pomodoroConfig, ...patch };
    set({ pomodoroConfig: newConfig });
    get().saveToStorage();
  },

  updateStreakConfig: (patch) => {
    set((s) => ({ streakConfig: { ...s.streakConfig, ...patch } }));
    get().saveToStorage();
  },

  toggleHardcoreMode: () => {
    set((s) => ({ hardcoreMode: !s.hardcoreMode }));
    get().saveToStorage();
  },

  loadForUser: (userId) => {
    const saved = loadFromStorage(userId);
    const pomodoroConfig = saved.pomodoroConfig ?? DEFAULT_POMODORO_CONFIG;
    set({
      userId,
      sessions: saved.sessions ?? INITIAL_SESSIONS,
      subjects: saved.subjects ?? DEFAULT_SUBJECTS,
      pomodoroConfig,
      streakConfig: saved.streakConfig ?? DEFAULT_STREAK_CONFIG,
      selectedSubjectId: saved.selectedSubjectId ?? DEFAULT_SUBJECTS[0].id,
      pomoCyclesCompleted: saved.pomoCyclesCompleted ?? 0,
      hardcoreMode: saved.hardcoreMode ?? false,
      mode: (saved.mode as TimerMode) ?? "pomodoro",
      status: (saved.status as TimerStatus) ?? "idle",
      elapsed: saved.elapsed ?? 0,
      remaining: saved.remaining ?? pomodoroConfig.workDuration,
      pomodoroPhase: (saved.pomodoroPhase as PomodoroPhase) ?? "work",
      timerStartedAt: saved.timerStartedAt ?? null,
      elapsedAtStart: saved.elapsedAtStart ?? 0,
      remainingAtStart: saved.remainingAtStart ?? pomodoroConfig.workDuration,
      currentSessionStart: saved.currentSessionStart ?? null,
    });
  },

  saveToStorage: () => {
    const s = get();
    saveToStorageRaw(s.userId, {
      sessions: s.sessions,
      subjects: s.subjects,
      pomodoroConfig: s.pomodoroConfig,
      streakConfig: s.streakConfig,
      selectedSubjectId: s.selectedSubjectId,
      pomoCyclesCompleted: s.pomoCyclesCompleted,
      hardcoreMode: s.hardcoreMode,
      mode: s.mode,
      status: s.status,
      elapsed: s.elapsed,
      remaining: s.remaining,
      pomodoroPhase: s.pomodoroPhase,
      timerStartedAt: s.timerStartedAt,
      elapsedAtStart: s.elapsedAtStart,
      remainingAtStart: s.remainingAtStart,
      currentSessionStart: s.currentSessionStart,
    });
  },
}));
