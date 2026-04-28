import { StudySession, SubjectKey } from "@/types";
import { generateId } from "./utils";

function dateKey(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function session(
  subjectId: SubjectKey,
  daysAgo: number,
  minutes: number
): StudySession {
  return {
    id: generateId(),
    subjectId,
    duration: minutes * 60,
    date: dateKey(daysAgo),
    mode: "pomodoro",
    createdAt: Date.now() - daysAgo * 86400000,
  };
}

export const INITIAL_SESSIONS: StudySession[] = [
  // Today — partial
  session("maths", 0, 50),
  session("eco", 0, 30),

  // Yesterday — full day
  session("maths", 1, 100),
  session("philo", 1, 50),
  session("eco", 1, 80),

  // 2 days ago
  session("maths", 2, 60),
  session("eco", 2, 110),
  session("francais", 2, 50),

  // 3 days ago
  session("philo", 3, 90),
  session("maths", 3, 50),
  session("histoire", 3, 60),

  // 4 days ago
  session("eco", 4, 120),
  session("anglais", 4, 50),

  // 5 days ago
  session("maths", 5, 80),
  session("philo", 5, 70),
  session("francais", 5, 50),

  // 6 days ago (light)
  session("eco", 6, 40),
  session("maths", 6, 30),

  // Older sessions for monthly view
  session("maths", 8, 90),
  session("eco", 8, 60),
  session("philo", 9, 80),
  session("maths", 10, 100),
  session("eco", 11, 70),
  session("histoire", 12, 50),
  session("maths", 14, 110),
  session("eco", 15, 80),
  session("philo", 16, 60),
  session("francais", 17, 90),
  session("maths", 18, 70),
  session("anglais", 19, 50),
  session("eco", 20, 100),
  session("maths", 21, 80),
];
