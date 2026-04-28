import { Subject } from "@/types";

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: "maths", label: "Mathématiques", color: "#f97316", bgColor: "rgba(249,115,22,0.15)", goal: 600 },
  { id: "eco", label: "Économie", color: "#2dd4bf", bgColor: "rgba(45,212,191,0.15)", goal: 600 },
  { id: "philo", label: "Philosophie", color: "#f472b6", bgColor: "rgba(244,114,182,0.15)", goal: 600 },
  { id: "histoire", label: "Histoire", color: "#a78bfa", bgColor: "rgba(167,139,250,0.15)", goal: 420 },
  { id: "francais", label: "Français", color: "#34d399", bgColor: "rgba(52,211,153,0.15)", goal: 420 },
  { id: "anglais", label: "Anglais", color: "#60a5fa", bgColor: "rgba(96,165,250,0.15)", goal: 300 },
];

// Legacy SUBJECTS export for backward compat
export const SUBJECTS = DEFAULT_SUBJECTS;

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function getSubjectFromList(subjects: Subject[], id: string): Subject {
  return subjects.find((s) => s.id === id) ?? subjects[0] ?? DEFAULT_SUBJECTS[0];
}

// Legacy helper — reads from DEFAULT_SUBJECTS
export function getSubject(id: string): Subject {
  return DEFAULT_SUBJECTS.find((s) => s.id === id) ?? DEFAULT_SUBJECTS[0];
}
