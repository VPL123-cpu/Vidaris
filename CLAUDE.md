# Vidaris — CLAUDE.md

Application de suivi d'études pour prépa (pomodoro, stats, streak, gamification). Déployée en production sur Vercel + Supabase.

---

## Stack

| Couche | Technologie |
|--------|-------------|
| Monorepo | pnpm workspaces (`apps/web`, `apps/mobile`, `packages/shared`) |
| Web | Next.js 16.2.4, App Router, Turbopack, React 19, TypeScript |
| Mobile | Expo SDK 54, Expo Router 6, React Native 0.81.5 |
| Style | Tailwind CSS 4, Framer Motion, Recharts, Lucide |
| State | Zustand 5 |
| Auth + DB | Supabase (`@supabase/ssr` côté web, `AsyncStorage` côté mobile) |
| Deploy | Vercel (Root Directory = `apps/web`), Expo Go pour mobile |

**Thème :** dark navy `#0B0F1A`, gold `#F5C044`, teal `#2dd4bf`

---

## Commandes

```bash
pnpm dev:web          # Next.js sur localhost:3000
pnpm dev:mobile       # Expo (nécessite REACT_NATIVE_PACKAGER_HOSTNAME=<IP hotspot>)
pnpm build:web        # Build production web
```

---

## Architecture web (`apps/web/src/`)

```
app/
  (auth)/login, signup     ← pages auth (SaasLayout wrappé autour)
  auth/callback/route.ts   ← échange code Supabase → session + redirect /dashboard
  dashboard, timer, stats, subjects, goals, social, level, settings

components/
  layout/
    SaasLayout.tsx     ← layout root : initialise auth + store, wrappé dans RootLayout
    SiteHeader.tsx     ← header : widget amis, streak, XP, menu user (hover)
    Sidebar.tsx        ← navigation
    TimerProvider.tsx  ← tick() global, survit à la navigation
  timer/TimerPage.tsx
  dashboard/           ← KPIs, Chart, Subjects, Leaderboard, TimerRing

store/
  useAuthStore.ts    ← login/signup/logout + initialize() (onAuthStateChange)
  useStudyStore.ts   ← sessions, subjects, friendships, friendPresence + timer state

lib/
  supabase/client.ts  ← createBrowserClient (browser)
  supabase/server.ts  ← createServerClient (SSR/middleware)
  auth.ts             ← signIn/signUp/signOut/getCurrentUser

middleware.ts          ← protection routes, try/catch auth robuste
```

---

## Base de données Supabase

**Projet :** `eoftenjekyhqxlnwwuvl.supabase.co`

**4 tables :**
| Table | Description |
|-------|-------------|
| `users` | Profils (`id`, `name`, `email`) — créés via trigger `on_auth_user_created` |
| `subjects` | Matières (`user_id`, `name`, `color`, `weekly_goal`) |
| `sessions` | Sessions de travail (`user_id`, `subject_id`, `duration` en secondes, `started_at`, `mode`) |
| `friendships` | Amis (`user_id`, `friend_id`, `status: pending\|accepted`) |

**RLS activé** sur toutes les tables. Policies configurées :
- `subjects_all` : CRUD uniquement pour le propriétaire
- `sessions_own` : CRUD propriétaire + `sessions_friends_read` pour voir les sessions actives des amis
- `friendships_read/write` : lecture si user_id ou friend_id, écriture si user_id
- `users_read_all` : tout le monde peut lire les profils (pour noms d'amis)

**Session "active" :** `duration = 0` ET `started_at` dans les 4 dernières heures.

---

## Flux auth

1. Signup/Login → `signInWithPassword` via `createBrowserClient`
2. Après succès → `window.location.replace('/dashboard')` (hard redirect, assure les cookies)
3. Middleware (`middleware.ts`) → vérifie session via cookie, redirige `/login` si absent
4. Email confirmation : **désactivée** dans Supabase (Authentication → Providers → Email)
5. Site URL Supabase : `https://vidaris.vercel.app`

---

## Ce qui est fait ✅

- Monorepo pnpm (`apps/web`, `apps/mobile`, `packages/shared`)
- App web déployée sur **https://vidaris.vercel.app**
- App mobile tourne sur téléphone via **Expo Go** (développement)
- Auth Supabase complète (inscription, connexion, déconnexion)
- **Matières** : CRUD complet persisté en Supabase, avec objectif hebdomadaire
- **Sessions** : sauvegardées automatiquement dans Supabase au start/pause du timer
- **Timer** : Pomodoro + Chrono, persistent via `TimerProvider` global
- **Stats, Streak, XP/Niveau, Goals** : fonctionnels
- **Widget amis** dans le header : affiche les vrais amis depuis Supabase avec leur statut "en session"
- Logout immédiat (hard redirect `/login`)
- F5 stable (service worker fantôme éliminé via `public/sw.js`)

---

## Ce qui reste à faire ❌

### Priorité haute
1. **Ajouter des amis** (page Social) : implémenter le flow d'invitation par email/ID → INSERT dans `friendships` avec `status: pending`, puis acceptation
2. **Présence amis en temps réel** : subscription Supabase Realtime sur `sessions` au lieu du fetch one-shot

### Priorité moyenne
3. **Résumé hebdomadaire** : modal le lundi (total heures, meilleure matière, streak)
4. **Progression journalière par matière** : mini-barre dans SubjectSelector du timer (X min restantes / objectif)
5. **Historique des sessions** : page `/sessions` avec liste et suppression individuelle

### Priorité basse
6. **Mobile** : l'app mobile Expo est fonctionnelle (bundle OK) mais le design ne correspond pas au web — styler les écrans mobile pour qu'ils ressemblent au thème dark navy/gold

---

## Points techniques importants

- **`turbopack.root`** dans `next.config.ts` pointe vers la racine du monorepo — nécessaire pour que Turbopack résolve `@vidaris/shared` en dev
- **`packageManager: "pnpm@10.33.3"`** dans le `package.json` racine — obligatoire pour que Vercel utilise pnpm
- **`apps/web/package-lock.json`** doit ne PAS exister (supprimé) — sinon Vercel détecte npm
- **Mobile offline** : lancer avec `pnpm dev:mobile` (flag `--offline` pour éviter le bug `Body is unusable` de `@expo/cli`)
- **Mobile hotspot Windows** : `$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.137.1"` avant de lancer Expo
- **Port Expo** : ouvrir le firewall Windows pour TCP 8081/8082

---

## Variables d'environnement

**`apps/web/.env.local`** :
```
NEXT_PUBLIC_SUPABASE_URL=https://eoftenjekyhqxlnwwuvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé anon Supabase>
```

**`apps/mobile/.env`** :
```
EXPO_PUBLIC_SUPABASE_URL=https://eoftenjekyhqxlnwwuvl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<clé anon Supabase>
```

---

## GitHub

Repo : `https://github.com/VPL123-cpu/Vidaris.git` — branche `main`
