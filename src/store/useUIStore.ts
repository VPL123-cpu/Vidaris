"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  sidebarCollapsed: boolean;
  mobileOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setMobileOpen: (v: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileOpen: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setMobileOpen: (v) => set({ mobileOpen: v }),
    }),
    {
      name: "vidaris-ui",
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
