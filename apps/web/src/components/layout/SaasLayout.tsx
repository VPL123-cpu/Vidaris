"use client";

import { ReactNode, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { SiteHeader } from "./SiteHeader";
import { TimerProvider } from "./TimerProvider";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudyStore } from "@/store/useStudyStore";
import { useToastStore } from "@/store/useToastStore";

export function SaasLayout({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);
  const user = useAuthStore((s) => s.user);
  const hydrate = useStudyStore((s) => s.hydrate);
  const isHydrating = useStudyStore((s) => s.isHydrating);
  const studyError = useStudyStore((s) => s.error);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (initialized) hydrate(user?.id ?? null);
  }, [initialized, user?.id, hydrate]);

  useEffect(() => {
    if (studyError) addToast(studyError, "error");
  }, [studyError, addToast]);

  if (!initialized || isHydrating) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F1A]">
        <div className="w-6 h-6 rounded-full border-2 border-[#F5C044]/30 border-t-[#F5C044] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0B0F1A] overflow-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-60 left-1/4 w-[500px] h-[500px] rounded-full bg-[#F5C044]/[0.025] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#2dd4bf]/[0.025] blur-3xl" />
      </div>

      <TimerProvider />
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        <SiteHeader />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
