"use client";

import { create } from "zustand";
import { AppUser } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser, signIn, signOut, signUp, getAuthErrorMessage } from "@/lib/auth";

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

let _authSubscription: { unsubscribe: () => void } | null = null;

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

      _authSubscription?.unsubscribe();
      const supabase = createClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
        const refreshedUser = await getCurrentUser().catch(() => null);
        set({ user: refreshedUser });
      });
      _authSubscription = subscription;
    } catch (e) {
      set({ user: null, initialized: true, isLoading: false, error: getAuthErrorMessage(e as Error) });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await signIn(email, password);
      set({ user, isLoading: false });
    } catch (e) {
      set({ error: getAuthErrorMessage(e as Error), isLoading: false });
    }
  },

  signup: async (email, name, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await signUp(email, password, name);
      set({ user, isLoading: false });
    } catch (e) {
      set({ error: getAuthErrorMessage(e as Error), isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOut();
      set({ user: null, isLoading: false });
    } catch (e) {
      set({ error: getAuthErrorMessage(e as Error), isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
