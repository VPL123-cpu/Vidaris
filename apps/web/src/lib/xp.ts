export const XP_PER_MINUTE = 2;
export const XP_PER_STREAK_DAY = 10;
export const XP_GOAL_BONUS = 50;

export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.5;
  if (streak >= 7)  return 1.25;
  if (streak >= 3)  return 1.1;
  return 1;
}

// 25 niveaux — courbe douce au début, exponentielle ensuite
// Seuils cumulatifs en XP (XP_PER_MINUTE = 2, donc 1 XP ≈ 30 secondes d'étude)
// L2 : 25 min | L5 : ~4h | L10 : ~20h | L15 : ~53h | L20 : ~130h | L25 : ~340h
export const XP_LEVELS = [
     0,   // Niv. 1
    50,   // Niv. 2  — 25 min  (première session)
   150,   // Niv. 3  — +50 min
   300,   // Niv. 4  — +1h15
   500,   // Niv. 5  — +1h40
   750,   // Niv. 6  — +2h05
  1050,   // Niv. 7  — +2h30
  1410,   // Niv. 8  — +3h
  1860,   // Niv. 9  — +3h45
  2400,   // Niv. 10 — +4h30  ✦ palier
  3000,   // Niv. 11 — +5h
  3690,   // Niv. 12 — +5h45
  4470,   // Niv. 13 — +6h30
  5370,   // Niv. 14 — +7h30
  6390,   // Niv. 15 — +8h30  ✦ palier
  7590,   // Niv. 16 — +10h
  9030,   // Niv. 17 — +12h
 10830,   // Niv. 18 — +15h
 12990,   // Niv. 19 — +18h
 15630,   // Niv. 20 — +22h   ✦ palier
 18870,   // Niv. 21 — +27h
 22830,   // Niv. 22 — +33h
 27630,   // Niv. 23 — +40h
 33630,   // Niv. 24 — +50h
 40830,   // Niv. 25 — +60h   ✦ max
];

export const LEVEL_NAMES = [
  "Écolier",       // 1
  "Apprenti",      // 2
  "Curieux",       // 3
  "Studieux",      // 4
  "Appliqué",      // 5
  "Diligent",      // 6
  "Assidu",        // 7
  "Persévérant",   // 8
  "Concentré",     // 9
  "Déterminé",     // 10 ✦
  "Ambitieux",     // 11
  "Rigoureux",     // 12
  "Sérieux",       // 13
  "Coriace",       // 14
  "Expert",        // 15 ✦
  "Tenace",        // 16
  "Brillant",      // 17
  "Érudit",        // 18
  "Champion",      // 19
  "Élite",         // 20 ✦
  "Visionnaire",   // 21
  "Légendaire",    // 22
  "Maître",        // 23
  "Grand Maître",  // 24
  "Prépa Master",  // 25 ✦
];

// Niveaux jalons avec couleur spéciale
export const MILESTONE_LEVELS = new Set([10, 15, 20, 25]);

export function getMilestoneColor(level: number): string {
  if (level >= 25) return "#f59e0b"; // gold
  if (level >= 20) return "#a78bfa"; // violet
  if (level >= 15) return "#2dd4bf"; // teal
  if (level >= 10) return "#60a5fa"; // blue
  return "#F5C044";                  // default gold
}

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
  const next = XP_LEVELS[level] ?? current + 10000;
  return { current, next };
}

export function getLevelProgress(xp: number): {
  level: number;
  name: string;
  xpInLevel: number;
  xpForLevel: number;
  progressPct: number;
  color: string;
  isMilestone: boolean;
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
    color: getMilestoneColor(level),
    isMilestone: MILESTONE_LEVELS.has(level),
  };
}
