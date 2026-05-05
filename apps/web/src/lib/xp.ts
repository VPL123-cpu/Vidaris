export const XP_PER_MINUTE = 2;
export const XP_PER_STREAK_DAY = 10;
export const XP_GOAL_BONUS = 50;

export function getStreakMultiplier(streak: number): number {
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.25;
  if (streak >= 3) return 1.1;
  return 1;
}

export const XP_LEVELS = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2550, 3300, 4200,
];

export const LEVEL_NAMES = [
  "Débutant", "Curieux", "Studieux", "Appliqué", "Déterminé",
  "Sérieux", "Expert", "Champion", "Élite", "Légendaire", "Prépa Master",
];

export function calculateXP(totalMinutes: number, streak: number, goalsHit: number): number {
  const multiplier = getStreakMultiplier(streak);
  return Math.round(
    (totalMinutes * XP_PER_MINUTE + streak * XP_PER_STREAK_DAY) * multiplier +
    goalsHit * XP_GOAL_BONUS
  );
}

export function getLevel(xp: number): number {
  let level = 1;
  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i]) level = i + 1;
  }
  return Math.min(level, XP_LEVELS.length);
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[level - 1] ?? LEVEL_NAMES[LEVEL_NAMES.length - 1];
}

export function getXPRange(level: number): { current: number; next: number } {
  const current = XP_LEVELS[level - 1] ?? 0;
  const next = XP_LEVELS[level] ?? current + 1000;
  return { current, next };
}

export function getLevelProgress(xp: number): {
  level: number;
  name: string;
  xpInLevel: number;
  xpForLevel: number;
  progressPct: number;
} {
  const level = getLevel(xp);
  const { current, next } = getXPRange(level);
  const xpInLevel = xp - current;
  const xpForLevel = next - current;
  return {
    level,
    name: getLevelName(level),
    xpInLevel,
    xpForLevel,
    progressPct: Math.min((xpInLevel / xpForLevel) * 100, 100),
  };
}
