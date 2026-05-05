"use client";

import { useEffect } from "react";
import { useStudyStore } from "@/store/useStudyStore";

// Mounted once in SaasLayout — keeps the timer ticking across all pages
export function TimerProvider() {
  const tick = useStudyStore((s) => s.tick);
  const status = useStudyStore((s) => s.status);

  // Sync from stored timestamp immediately on mount (handles refresh / navigation)
  useEffect(() => {
    tick();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [status, tick]);

  return null;
}
