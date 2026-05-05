export interface Subject {
  id: string;
  userId: string;
  label: string;
  color: string;
  bgColor: string;
  goal: number; // minutes per week
  createdAt?: string;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  duration: number; // seconds
  date: string; // YYYY-MM-DD
  startedAt: string;
  mode: TimerMode;
  createdAt: number;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: "pending" | "accepted";
  createdAt: string;
}

export interface AppUser {
  id: string;
  email: string;
  name?: string;
}

export interface PomodoroConfig {
  workDuration: number; // seconds
  shortBreak: number; // seconds
  longBreak: number; // seconds
  cyclesBeforeLongBreak: number;
}

export interface DayData {
  date: string;
  sessions: StudySession[];
  totalMinutes: number;
}

export type TimerMode = "pomodoro" | "chrono";
export type TimerStatus = "idle" | "running" | "paused" | "break";

// kept for compat
export type SubjectKey = string;
