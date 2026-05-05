"use client";

import { create } from "zustand";
import { AppUser } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser, signIn, signOut, signUp } from "@/lib/auth";
import { useStudyStore } from "./useStudyStore";

interface AuthStore {
  user: AppUser | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isLoading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await getCurrentUser();
      set({ user, initialized: true, isLoading: false });
      await useStudyStore.getState().hydrate(user?.id ?? null);

      const supabase = createClient();
      supabase.auth.onAuthStateChange(async () => {
        const refreshedUser = await getCurrentUser().catch(() => null);
        set({ user: refreshedUser });
        await useStudyStore.getState().hydrate(refreshedUser?.id ?? null);
      });
    } catch (e) {
      set({
        user: null,
        initialized: true,
        isLoading: false,
        error: (e as Error).message,
      });
      await useStudyStore.getState().hydrate(null);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await signIn(email, password);
      set({ user, isLoading: false });
      await useStudyStore.getState().hydrate(user.id);
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  signup: async (email, name, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await signUp(email, password, name);
      set({ user, isLoading: false });
      await useStudyStore.getState().hydrate(user?.id ?? null);
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOut();
      set({ user: null, isLoading: false });
      await useStudyStore.getState().hydrate(null);
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
