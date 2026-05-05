"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import {
  Friendship,
  PomodoroConfig,
  StudySession,
  Subject,
  TimerMode,
  TimerStatus,
} from "@/types";
import { hexToRgba } from "@/lib/subjects";

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
  currentSessionId: string | null;
  currentSessionStart: string | null;
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
  friendships: Friendship[];
  pomodoroConfig: PomodoroConfig;
  streakConfig: StreakConfig;
  hardcoreMode: boolean;
  userId: string | null;
  isHydrating: boolean;
  error: string | null;

  hydrate: (userId: string | null) => Promise<void>;
  fetchSessions: () => Promise<void>;
  fetchSubjects: () => Promise<void>;
  fetchFriendships: () => Promise<void>;

  setMode: (mode: TimerMode) => void;
  setSubject: (subjectId: string) => void;
  startTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  tick: () => void;

  createSession: (input: {
    subjectId: string;
    duration: number;
    mode: TimerMode;
    startedAt?: string;
  }) => Promise<StudySession | null>;
  deleteSession: (id: string) => Promise<void>;
  clearSessions: () => Promise<void>;

  addSubject: (subject: Omit<Subject, "id" | "userId" | "createdAt">) => Promise<void>;
  updateSubject: (id: string, patch: Partial<Omit<Subject, "id" | "userId" | "createdAt">>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  updatePomodoroConfig: (patch: Partial<PomodoroConfig>) => void;
  updateStreakConfig: (patch: Partial<StreakConfig>) => void;
  toggleHardcoreMode: () => void;
}

type SubjectRow = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  weekly_goal: number;
  created_at: string;
};

type SessionRow = {
  id: string;
  user_id: string;
  subject_id: string | null;
  duration: number;
  started_at: string;
  created_at: string;
  mode: TimerMode;
};

type FriendshipRow = {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted";
  created_at: string;
};

function mapSubject(row: SubjectRow): Subject {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.name,
    color: row.color,
    bgColor: hexToRgba(row.color, 0.15),
    goal: row.weekly_goal,
    createdAt: row.created_at,
  };
}

function mapSession(row: SessionRow): StudySession {
  return {
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id ?? "",
    duration: row.duration,
    date: row.started_at.split("T")[0],
    startedAt: row.started_at,
    mode: row.mode,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function mapFriendship(row: FriendshipRow): Friendship {
  return {
    id: row.id,
    userId: row.user_id,
    friendId: row.friend_id,
    status: row.status,
    createdAt: row.created_at,
  };
}

function requireUser(userId: string | null): string {
  if (!userId) throw new Error("Utilisateur non authentifie.");
  return userId;
}

export const useStudyStore = create<StudyStore>()((set, get) => ({
  mode: "pomodoro",
  status: "idle",
  elapsed: 0,
  remaining: DEFAULT_POMODORO_CONFIG.workDuration,
  pomodoroPhase: "work",
  pomoCyclesCompleted: 0,
  selectedSubjectId: "",
  currentSessionId: null,
  currentSessionStart: null,
  timerStartedAt: null,
  elapsedAtStart: 0,
  remainingAtStart: DEFAULT_POMODORO_CONFIG.workDuration,

  sessions: [],
  subjects: [],
  friendships: [],
  pomodoroConfig: DEFAULT_POMODORO_CONFIG,
  streakConfig: DEFAULT_STREAK_CONFIG,
  hardcoreMode: false,
  userId: null,
  isHydrating: false,
  error: null,

  hydrate: async (userId) => {
    if (!userId) {
      set({
        userId: null,
        sessions: [],
        subjects: [],
        friendships: [],
        selectedSubjectId: "",
        status: "idle",
        elapsed: 0,
        currentSessionId: null,
        currentSessionStart: null,
        timerStartedAt: null,
        isHydrating: false,
      });
      return;
    }

    set({ userId, isHydrating: true, error: null });
    await Promise.all([
      get().fetchSessions(),
      get().fetchSubjects(),
      get().fetchFriendships(),
    ]);

    const subjects = get().subjects;
    set((s) => ({
      selectedSubjectId:
        s.selectedSubjectId && subjects.some((sub) => sub.id === s.selectedSubjectId)
          ? s.selectedSubjectId
          : subjects[0]?.id ?? "",
      isHydrating: false,
    }));
  },

  fetchSessions: async () => {
    try {
      requireUser(get().userId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sessions")
        .select("id,user_id,subject_id,duration,started_at,created_at,mode")
        .order("started_at", { ascending: false });
      if (error) throw error;
      set({ sessions: (data ?? []).map((row) => mapSession(row as SessionRow)) });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  fetchSubjects: async () => {
    try {
      requireUser(get().userId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("subjects")
        .select("id,user_id,name,color,weekly_goal,created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      set({ subjects: (data ?? []).map((row) => mapSubject(row as SubjectRow)) });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  fetchFriendships: async () => {
    try {
      requireUser(get().userId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("friendships")
        .select("id,user_id,friend_id,status,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      set({ friendships: (data ?? []).map((row) => mapFriendship(row as FriendshipRow)) });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  setMode: (mode) => {
    const { pomodoroConfig } = get();
    const remaining = mode === "pomodoro" ? pomodoroConfig.workDuration : 0;
    set({
      mode,
      remaining,
      elapsed: 0,
      status: "idle",
      pomodoroPhase: "work",
      currentSessionId: null,
      currentSessionStart: null,
      timerStartedAt: null,
      elapsedAtStart: 0,
      remainingAtStart: remaining,
    });
  },

  setSubject: (subjectId) => set({ selectedSubjectId: subjectId }),

  startTimer: async () => {
    const { elapsed, remaining, selectedSubjectId, mode, userId } = get();
    if (!selectedSubjectId) {
      set({ error: "Cree une matiere avant de lancer le timer." });
      return;
    }

    try {
      const uid = requireUser(userId);
      const supabase = createClient();
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("sessions")
        .insert({
          user_id: uid,
          subject_id: selectedSubjectId,
          duration: 0,
          started_at: now,
          mode,
        })
        .select("id,user_id,subject_id,duration,started_at,created_at,mode")
        .single();
      if (error) throw error;

      const session = mapSession(data as SessionRow);
      set((s) => ({
        sessions: [session, ...s.sessions],
        status: "running",
        currentSessionId: session.id,
        currentSessionStart: now,
        timerStartedAt: Date.now(),
        elapsedAtStart: elapsed,
        remainingAtStart: remaining,
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  pauseTimer: async () => {
    const { elapsed, currentSessionId } = get();
    if (!currentSessionId) {
      set({ status: "paused", currentSessionId: null, currentSessionStart: null, timerStartedAt: null });
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("sessions")
        .update({ duration: Math.max(0, elapsed) })
        .eq("id", currentSessionId);
      if (error) throw error;

      set((s) => ({
        sessions: s.sessions.map((session) =>
          session.id === currentSessionId ? { ...session, duration: Math.max(0, elapsed) } : session
        ),
        status: "paused",
        currentSessionId: null,
        currentSessionStart: null,
        timerStartedAt: null,
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  resetTimer: async () => {
    const { mode, pomodoroConfig, currentSessionId, status } = get();
    if (currentSessionId && status === "running") {
      await get().deleteSession(currentSessionId);
    }
    const remaining = mode === "pomodoro" ? pomodoroConfig.workDuration : 0;
    set({
      status: "idle",
      elapsed: 0,
      remaining,
      pomodoroPhase: "work",
      currentSessionId: null,
      currentSessionStart: null,
      timerStartedAt: null,
      elapsedAtStart: 0,
      remainingAtStart: remaining,
    });
  },

  tick: () => {
    const {
      mode,
      status,
      timerStartedAt,
      elapsedAtStart,
      remainingAtStart,
      pomodoroPhase,
      pomoCyclesCompleted,
      pomodoroConfig,
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

    if (pomodoroPhase === "work") {
      void get().pauseTimer();
      const newCycles = pomoCyclesCompleted + 1;
      const isLongBreak = newCycles % pomodoroConfig.cyclesBeforeLongBreak === 0;
      const nextRemaining = isLongBreak ? pomodoroConfig.longBreak : pomodoroConfig.shortBreak;
      set({
        status: "running",
        pomodoroPhase: isLongBreak ? "longBreak" : "shortBreak",
        remaining: nextRemaining,
        elapsed: 0,
        pomoCyclesCompleted: newCycles,
        currentSessionId: null,
        currentSessionStart: null,
        timerStartedAt: Date.now(),
        elapsedAtStart: 0,
        remainingAtStart: nextRemaining,
      });
    } else {
      set({
        pomodoroPhase: "work",
        remaining: pomodoroConfig.workDuration,
        elapsed: 0,
        status: "idle",
        currentSessionId: null,
        currentSessionStart: null,
        timerStartedAt: null,
        elapsedAtStart: 0,
        remainingAtStart: pomodoroConfig.workDuration,
      });
    }
  },

  createSession: async ({ subjectId, duration, mode, startedAt }) => {
    try {
      const uid = requireUser(get().userId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sessions")
        .insert({
          user_id: uid,
          subject_id: subjectId,
          duration,
          started_at: startedAt ?? new Date().toISOString(),
          mode,
        })
        .select("id,user_id,subject_id,duration,started_at,created_at,mode")
        .single();
      if (error) throw error;

      const session = mapSession(data as SessionRow);
      set((s) => ({ sessions: [session, ...s.sessions] }));
      return session;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },

  deleteSession: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) throw error;
      set((s) => ({ sessions: s.sessions.filter((session) => session.id !== id) }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  clearSessions: async () => {
    try {
      const userId = requireUser(get().userId);
      const supabase = createClient();
      const { error } = await supabase.from("sessions").delete().eq("user_id", userId);
      if (error) throw error;
      set({ sessions: [] });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  addSubject: async (subject) => {
    try {
      const uid = requireUser(get().userId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("subjects")
        .insert({
          user_id: uid,
          name: subject.label,
          color: subject.color,
          weekly_goal: subject.goal,
        })
        .select("id,user_id,name,color,weekly_goal,created_at")
        .single();
      if (error) throw error;

      const newSubject = mapSubject(data as SubjectRow);
      set((s) => ({
        subjects: [...s.subjects, newSubject],
        selectedSubjectId: s.selectedSubjectId || newSubject.id,
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  updateSubject: async (id, patch) => {
    try {
      const supabase = createClient();
      const payload: Record<string, string | number> = {};
      if (patch.label !== undefined) payload.name = patch.label;
      if (patch.color !== undefined) payload.color = patch.color;
      if (patch.goal !== undefined) payload.weekly_goal = patch.goal;

      const { data, error } = await supabase
        .from("subjects")
        .update(payload)
        .eq("id", id)
        .select("id,user_id,name,color,weekly_goal,created_at")
        .single();
      if (error) throw error;

      const updated = mapSubject(data as SubjectRow);
      set((s) => ({
        subjects: s.subjects.map((subject) => (subject.id === id ? updated : subject)),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  deleteSubject: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;

      set((s) => {
        const subjects = s.subjects.filter((subject) => subject.id !== id);
        return {
          subjects,
          selectedSubjectId:
            s.selectedSubjectId === id ? subjects[0]?.id ?? "" : s.selectedSubjectId,
        };
      });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  updatePomodoroConfig: (patch) => {
    set((s) => ({ pomodoroConfig: { ...s.pomodoroConfig, ...patch } }));
  },

  updateStreakConfig: (patch) => {
    set((s) => ({ streakConfig: { ...s.streakConfig, ...patch } }));
  },

  toggleHardcoreMode: () => {
    set((s) => ({ hardcoreMode: !s.hardcoreMode }));
  },
}));
