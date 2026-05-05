import type { StudySession } from "../types/index";
import { getTotalMinutesForDate } from "./utils";
export { getStreakMultiplier } from "./xp";

export interface DayStatus {
  date: string;
  minutes: number;
  validated: boolean;
  isToday: boolean;
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) return "Lance ta première session !";
  if (streak <= 3) return "Bon début, continue !";
  if (streak <= 7) return "Tu es lancé 🚀";
  if (streak <= 13) return "Impressionnant !";
  return "Tu es une machine 🔥";
}

export function buildCalendarDays(
  sessions: StudySession[],
  minMinutes: number,
  days = 30
): DayStatus[] {
  const today = new Date().toISOString().split("T")[0];
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const date = d.toISOString().split("T")[0];
    const minutes = getTotalMinutesForDate(sessions, date);
    return { date, minutes, validated: minutes >= minMinutes, isToday: date === today };
  });
}

export function calculateLongestStreak(
  sessions: StudySession[],
  minMinutes: number
): number {
  const allDates = [...new Set(sessions.map((s) => s.date))].sort();
  const validated = allDates.filter(
    (date) => getTotalMinutesForDate(sessions, date) >= minMinutes
  );
  if (validated.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < validated.length; i++) {
    const diff =
      (new Date(validated[i]).getTime() - new Date(validated[i - 1]).getTime()) / 86400000;
    current = diff === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}
