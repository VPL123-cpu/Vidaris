import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { StudySession, SubjectKey } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export function formatDurationFromSeconds(seconds: number): string {
  return formatDuration(Math.floor(seconds / 60));
}

export function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function getWeekDates(): string[] {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

export function getSessionsForDate(sessions: StudySession[], date: string) {
  return sessions.filter((s) => s.date === date);
}

export function getTotalMinutesForDate(sessions: StudySession[], date: string) {
  // Additionner les secondes d'abord puis convertir — évite que 15s+55s=0 au lieu de 1min
  const totalSeconds = getSessionsForDate(sessions, date).reduce(
    (acc, s) => acc + s.duration,
    0
  );
  return Math.floor(totalSeconds / 60);
}

export function getTotalMinutesForSubject(
  sessions: StudySession[],
  subjectId: SubjectKey,
  dates?: string[]
) {
  const filtered = dates
    ? sessions.filter((s) => dates.includes(s.date))
    : sessions;
  const totalSeconds = filtered
    .filter((s) => s.subjectId === subjectId)
    .reduce((acc, s) => acc + s.duration, 0);
  return Math.floor(totalSeconds / 60);
}

export function calculateStreak(sessions: StudySession[], minMinutes = 30): number {
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = d.toISOString().split("T")[0];
    const mins = getTotalMinutesForDate(sessions, dateKey);

    if (i === 0 && mins < minMinutes) {
      continue;
    } else if (mins >= minMinutes) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
