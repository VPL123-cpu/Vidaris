import { supabase } from "./supabase";
import type { AppUser } from "@vidaris/shared";

function toAppUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: { name?: string };
}): AppUser {
  return {
    id: user.id,
    email: user.email ?? "",
    name: user.user_metadata?.name,
  };
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user ? toAppUser(user) : null;
}

export async function signUp(email: string, password: string, name?: string): Promise<AppUser | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: name ? { name } : undefined },
  });
  if (error) throw error;
  return data.user ? toAppUser(data.user) : null;
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const user = await getCurrentUser();
  if (!user) throw new Error("Impossible de vérifier l'utilisateur connecté.");
  return user;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
