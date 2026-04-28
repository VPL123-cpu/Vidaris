"use client";

import { create } from "zustand";
import { StoredUser, getCurrentUser, signIn, signOut, signUp } from "@/lib/auth";
import { useStudyStore } from "./useStudyStore";

interface AuthStore {
  user: StoredUser | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;

  initialize: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isLoading: false,
  error: null,
  initialized: false,

  initialize: () => {
    const user = getCurrentUser();
    set({ user, initialized: true });
    useStudyStore.getState().loadForUser(user?.id ?? null);
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await signIn(email, password);
      set({ user, isLoading: false });
      useStudyStore.getState().loadForUser(user.id);
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  signup: async (email, name, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await signUp(email, name, password);
      set({ user, isLoading: false });
      useStudyStore.getState().loadForUser(user.id);
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  logout: () => {
    signOut();
    set({ user: null });
    useStudyStore.getState().loadForUser(null);
  },

  clearError: () => set({ error: null }),
}));
