export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: number;
}

const USERS_KEY = "vidaris-users";
const SESSION_KEY = "vidaris-session";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "vidaris-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function signUp(
  email: string,
  name: string,
  password: string
): Promise<StoredUser> {
  const users = getUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Un compte avec cet email existe déjà.");
  }
  const user: StoredUser = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    name,
    passwordHash: await hashPassword(password),
    createdAt: Date.now(),
  };
  saveUsers([...users, user]);
  setSession(user.id);
  return user;
}

export async function signIn(
  email: string,
  password: string
): Promise<StoredUser> {
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("Email ou mot de passe incorrect.");
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) throw new Error("Email ou mot de passe incorrect.");
  setSession(user.id);
  return user;
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function setSession(userId: string): void {
  localStorage.setItem(SESSION_KEY, userId);
}

export function getSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function getUserById(id: string): StoredUser | null {
  return getUsers().find((u) => u.id === id) ?? null;
}

export function getCurrentUser(): StoredUser | null {
  const sessionId = getSession();
  if (!sessionId) return null;
  return getUserById(sessionId);
}
