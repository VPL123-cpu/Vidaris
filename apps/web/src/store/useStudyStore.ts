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
  friendPresence: FriendPresenceData[];
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
  fetchFriendPresence: () => Promise<void>;

  setMode: (mode: TimerMode) => void;
  setSubject: (subjectId: string) => void;
  startTimer: (subjectId?: string) => Promise<void>;
  pauseTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
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

  sendFriendRequest: (email: string) => Promise<{ success: boolean; error?: string }>;
  acceptFriendRequest: (friendshipId: string) => Promise<void>;
  declineFriendRequest: (friendshipId: string) => Promise<void>;
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

export interface FriendPresenceData {
  id: string;
  name: string;
  color: string;
  studying: boolean;
  subjectLabel?: string;
}

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
  friendPresence: [],
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
    await get().fetchFriendPresence();

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
      const uid = requireUser(get().userId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sessions")
        .select("id,user_id,subject_id,duration,started_at,created_at,mode")
        .eq("user_id", uid)
        .order("started_at", { ascending: false });
      if (error) throw error;
      set({ sessions: (data ?? []).map((row) => mapSession(row as SessionRow)) });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  fetchSubjects: async () => {
    try {
      const uid = requireUser(get().userId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("subjects")
        .select("id,user_id,name,color,weekly_goal,created_at")
        .eq("user_id", uid)
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

  fetchFriendPresence: async () => {
    const { userId, friendships } = get();
    if (!userId) { set({ friendPresence: [] }); return; }

    const friendIds = friendships
      .filter((f) => f.status === "accepted")
      .map((f) => (f.userId === userId ? f.friendId : f.userId));

    if (friendIds.length === 0) { set({ friendPresence: [] }); return; }

    try {
      const supabase = createClient();
      const COLORS = ["#F5C044","#2dd4bf","#a78bfa","#f472b6","#34d399","#60a5fa","#fb7185"];

      const [{ data: profiles }, { data: activeSessions }] = await Promise.all([
        supabase.from("users").select("id,name,email").in("id", friendIds),
        supabase
          .from("sessions")
          .select("user_id,subject_id")
          .in("user_id", friendIds)
          .eq("duration", 0)
          .gte("started_at", new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()),
      ]);

      const activeMap = new Map((activeSessions ?? []).map((s) => [s.user_id as string, s.subject_id as string | null]));

      set({
        friendPresence: (profiles ?? []).map((p, i) => ({
          id: p.id as string,
          name: (p.name as string) ?? (p.email as string)?.split("@")[0] ?? "Ami",
          color: COLORS[i % COLORS.length],
          studying: activeMap.has(p.id as string),
          subjectLabel: undefined,
        })),
      });
    } catch {
      set({ friendPresence: [] });
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

  startTimer: async (overrideSubjectId?: string) => {
    const { elapsed, remaining, mode, userId } = get();
    const subjectId = overrideSubjectId ?? get().selectedSubjectId;

    if (!subjectId) {
      set({ error: "Cree une matiere avant de lancer le timer." });
      return;
    }

    const now = new Date().toISOString();

    // Démarrage optimiste : le timer démarre IMMÉDIATEMENT localement
    // sans attendre la réponse Supabase pour que l'UI soit réactive.
    set({
      selectedSubjectId: subjectId,
      status: "running",
      currentSessionId: null,   // sera mis à jour dès que Supabase répond
      currentSessionStart: now,
      timerStartedAt: Date.now(),
      elapsedAtStart: elapsed,
      remainingAtStart: remaining,
    });

    // Sync Supabase en arrière-plan
    try {
      const uid = requireUser(userId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sessions")
        .insert({
          user_id: uid,
          subject_id: subjectId,
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
        currentSessionId: session.id,
      }));
    } catch (e) {
      // Revert si la sauvegarde Supabase échoue
      set({
        status: "idle",
        timerStartedAt: null,
        currentSessionStart: null,
        currentSessionId: null,
        error: (e as Error).message,
      });
    }
  },

  pauseTimer: async () => {
    const { elapsed, elapsedAtStart, currentSessionId } = get();
    if (!currentSessionId) {
      set({ status: "paused", currentSessionId: null, currentSessionStart: null, timerStartedAt: null });
      return;
    }

    // Durée réelle de CE segment uniquement (elapsed est le total depuis le tout premier start)
    const segmentDuration = Math.max(1, elapsed - elapsedAtStart);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("sessions")
        .update({ duration: segmentDuration })
        .eq("id", currentSessionId);
      if (error) throw error;

      set((s) => ({
        sessions: s.sessions.map((session) =>
          session.id === currentSessionId ? { ...session, duration: segmentDuration } : session
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

  stopTimer: async () => {
    const { elapsed, elapsedAtStart, currentSessionId, mode, pomodoroConfig } = get();

    // Durée réelle de CE segment uniquement (elapsed accumule depuis le premier start)
    const segmentDuration = Math.max(0, elapsed - elapsedAtStart);

    if (currentSessionId) {
      if (segmentDuration > 0) {
        try {
          const supabase = createClient();
          const { error } = await supabase
            .from("sessions")
            .update({ duration: segmentDuration })
            .eq("id", currentSessionId);
          if (error) throw error;
          set((s) => ({
            sessions: s.sessions.map((sess) =>
              sess.id === currentSessionId ? { ...sess, duration: segmentDuration } : sess
            ),
          }));
        } catch (e) {
          set({ error: (e as Error).message });
        }
      } else {
        // Aucun temps écoulé : supprimer la session vide
        await get().deleteSession(currentSessionId);
      }
    }
    // Si status était "paused" : currentSessionId est null, durée déjà sauvée dans pauseTimer

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

    // Resync depuis Supabase pour garantir que le dashboard et les stats sont à jour
    await get().fetchSessions();
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
      // Mettre elapsed à jour avant pauseTimer pour que la bonne durée soit sauvée
      set({ elapsed: newElapsed });
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
      const { error } = await supabase
        .from("subjects")
        .insert({
          user_id: uid,
          name: subject.label,
          color: subject.color,
          weekly_goal: subject.goal,
        });
      if (error) throw error;
      await get().fetchSubjects();
      const subjects = get().subjects;
      set((s) => ({
        selectedSubjectId: s.selectedSubjectId || subjects[subjects.length - 1]?.id || "",
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

  sendFriendRequest: async (email) => {
    try {
      const uid = requireUser(get().userId);
      const supabase = createClient();

      const { data: targetUsers, error: findError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.trim().toLowerCase());

      if (findError || !targetUsers || targetUsers.length === 0) {
        return { success: false, error: "Aucun compte trouvé avec cet email." };
      }

      const targetUser = targetUsers[0] as { id: string };

      if (targetUser.id === uid) {
        return { success: false, error: "Tu ne peux pas t'ajouter toi-même." };
      }

      const { data: existing } = await supabase
        .from("friendships")
        .select("id, status")
        .or(
          `and(user_id.eq.${uid},friend_id.eq.${targetUser.id}),and(user_id.eq.${targetUser.id},friend_id.eq.${uid})`
        );

      if (existing && existing.length > 0) {
        const f = existing[0] as { status: string };
        if (f.status === "accepted") return { success: false, error: "Vous êtes déjà amis." };
        return { success: false, error: "Une demande est déjà en attente." };
      }

      const { error } = await supabase
        .from("friendships")
        .insert({ user_id: uid, friend_id: targetUser.id, status: "pending" });

      if (error) throw error;

      await get().fetchFriendships();
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  acceptFriendRequest: async (friendshipId) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId);
      if (error) throw error;
      await get().fetchFriendships();
      await get().fetchFriendPresence();
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  declineFriendRequest: async (friendshipId) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);
      if (error) throw error;
      await get().fetchFriendships();
      await get().fetchFriendPresence();
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
