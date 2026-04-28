export interface Subject {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  goal: number; // minutes per week
}

export interface StudySession {
  id: string;
  subjectId: string;
  duration: number; // seconds
  date: string; // YYYY-MM-DD
  mode: "pomodoro" | "chrono";
  createdAt: number;
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
