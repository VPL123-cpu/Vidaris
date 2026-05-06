import { createClient } from "@/lib/supabase/client";
import { AppUser } from "@/types";

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

export function getAuthErrorMessage(error: Error): string {
  const msg = error.message.toLowerCase();
  if (msg.includes("invalid login credentials") || msg.includes("invalid email or password")) {
    return "Email ou mot de passe incorrect.";
  }
  if (msg.includes("user already registered") || msg.includes("already been registered")) {
    return "Un compte existe déjà avec cet email.";
  }
  if (msg.includes("password should be at least")) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  if (msg.includes("too many requests") || msg.includes("rate limit")) {
    return "Trop de tentatives. Réessaie dans quelques minutes.";
  }
  if (msg.includes("email not confirmed")) {
    return "Confirme ton email avant de te connecter.";
  }
  return "Une erreur est survenue. Réessaie.";
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user ? toAppUser(user) : null;
}

export async function signUp(
  email: string,
  password: string,
  name?: string
): Promise<AppUser | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: name ? { name } : undefined,
    },
  });

  if (error) throw error;
  return data.user ? toAppUser(data.user) : null;
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const user = await getCurrentUser();
  if (!user) throw new Error("Impossible de verifier l'utilisateur connecte.");
  return user;
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  // scope: 'local' clears the session immediately without waiting for the server API call
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw error;
}
