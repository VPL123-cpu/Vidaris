# Vidaris — CLAUDE.md

Application de suivi d'études pour prépa (pomodoro, stats, streak, gamification). Déployée en production sur Vercel + Supabase.

---

## Déploiement — règle absolue

**Après chaque modification de code, toujours commit + push sur `main` pour déclencher un redéploiement Vercel automatique :**

```bash
git -C /c/Users/pinau/Documents/Vidaris add <fichiers>
git -C /c/Users/pinau/Documents/Vidaris commit -m "description"
git -C /c/Users/pinau/Documents/Vidaris push origin main
```

Si aucun fichier n'a changé mais qu'on veut forcer un redéploiement :
```bash
git -C /c/Users/pinau/Documents/Vidaris commit --allow-empty -m "chore: trigger Vercel redeploy"
git -C /c/Users/pinau/Documents/Vidaris push origin main
```

> Le CWD du shell est `apps/web` — toujours utiliser `git -C /c/Users/pinau/Documents/Vidaris` pour les commandes git, ou les chemins absolus pour `git add`.

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
  (auth)/login, signup     ← pages auth
  auth/callback/route.ts   ← échange code Supabase → session + redirect /dashboard
  dashboard, timer, stats, subjects, goals, social, level, settings

components/
  layout/
    SaasLayout.tsx     ← layout root : initialise auth + store
    SiteHeader.tsx     ← header : widget amis, streak, XP, menu user (hover)
    Sidebar.tsx        ← navigation
    TimerProvider.tsx  ← tick() global, survit à la navigation
  timer/TimerPage.tsx
  dashboard/           ← KPIs, DashboardChart, DashboardSubjects, DashboardTimerRing
  stats/WeeklyChart.tsx

store/
  useAuthStore.ts    ← login/signup/logout + initialize() (onAuthStateChange)
  useStudyStore.ts   ← sessions, subjects, friendships, friendPresence, timer state
                        + Realtime subscription friend presence (_presenceChannel)

lib/
  supabase/client.ts  ← createBrowserClient (browser)
  supabase/server.ts  ← createServerClient (SSR/middleware)
  auth.ts             ← signIn/signUp/signOut/getCurrentUser
  xp.ts               ← système XP 25 niveaux, courbe exponentielle
  utils.ts            ← getTotalMinutesForDate (somme secondes puis floor), calculateStreak

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
- `friendships_read` : lecture si `user_id` ou `friend_id`
- `friendships_insert` : INSERT si `user_id = auth.uid()`
- `friendships_update` : UPDATE si `user_id = auth.uid()` **OU** `friend_id = auth.uid()` (permet d'accepter)
- `friendships_delete` : DELETE si `user_id = auth.uid()` **OU** `friend_id = auth.uid()`
- `users_read_all` : tout le monde peut lire les profils

**Session "active" :** `duration = 0` ET `started_at` dans les 4 dernières heures.

**Realtime activé** sur la table `sessions` — utilisé pour la présence amis en temps réel.

---

## Flux auth

1. Signup/Login → `signInWithPassword` via `createBrowserClient`
2. Après succès → `window.location.replace('/dashboard')` (hard redirect, assure les cookies)
3. Middleware (`middleware.ts`) → vérifie session via cookie, redirige `/login` si absent
4. Logout → `signOut({ scope: "local" })` + redirect immédiat sans await
5. Email confirmation : **désactivée** dans Supabase (Authentication → Providers → Email)
6. Site URL Supabase : `https://vidaris.vercel.app`

---

## Flux timer

- `startTimer(subjectId)` : optimistic (status → "running" immédiat), INSERT Supabase en background
- `pauseTimer()` : sauvegarde le segment courant (`elapsed - elapsedAtStart`), UPDATE Supabase
- `stopTimer()` : sauvegarde segment, reset UI immédiat, UPDATE/INSERT Supabase, puis `fetchSessions()` en finally
- `tick()` : appelé chaque seconde par `TimerProvider`, gère la fin de phase Pomodoro
- **Race condition** : si l'utilisateur stoppe avant que l'INSERT de startTimer revienne, stopTimer fait un INSERT direct avec la durée correcte
- **Durées** : toujours sommer les secondes d'abord puis `Math.floor` une seule fois (évite les pertes de sous-minutes)

---

## Système XP & Niveaux (`lib/xp.ts`)

- 25 niveaux, courbe douce au début (niveau 2 en 25 min) puis exponentielle (niveau 25 ≈ 340h)
- `XP_PER_MINUTE = 2`, `XP_PER_STREAK_DAY = 10`, `XP_GOAL_BONUS = 50`
- Multiplicateur streak : ×1.1 (3j), ×1.25 (7j), ×1.5 (14j), ×2.0 (30j)
- Niveaux jalons (couleur spéciale) : 10 (bleu), 15 (teal), 20 (violet), 25 (gold)

---

## Présence amis en temps réel

- `fetchFriendPresence()` : fetch one-shot des profils + sessions actives des amis
- À la fin du fetch, si des amis existent et `_presenceChannel === null`, crée un channel Supabase Realtime sur `postgres_changes` de la table `sessions`
- Le callback du channel appelle `fetchFriendPresence()` avec un debounce de 400ms
- `_presenceChannel` est unsubscribed dans `hydrate(null)` (logout)
- Les `subjectLabel` des amis en session sont résolus depuis le store local

---

## Ce qui est fait ✅

- Monorepo pnpm (`apps/web`, `apps/mobile`, `packages/shared`)
- App web déployée sur **https://vidaris.vercel.app**
- App mobile tourne sur téléphone via **Expo Go** (développement)
- Auth Supabase complète (inscription, connexion, déconnexion instantanée)
- **Matières** : CRUD complet persisté en Supabase, avec objectif hebdomadaire
- **Sessions** : sauvegardées automatiquement dans Supabase, résistantes aux race conditions
- **Timer** : Pomodoro + Chrono, persistent via `TimerProvider` global
- **Stats, Streak, XP/Niveau, Goals** : fonctionnels
- **Social** : invitation par email, acceptation/refus, présence amis en temps réel
- **Logout immédiat** (redirect sans await)
- **Graphiques** : Y-axis lisible, barres avec arrondi sur le dessus du dernier segment visible
- F5 stable (service worker fantôme éliminé via `public/sw.js`)

---

## Ce qui reste à faire ❌

### Priorité moyenne
1. **Résumé hebdomadaire** : modal le lundi (total heures, meilleure matière, streak)
2. **Progression journalière par matière** : mini-barre dans SubjectSelector du timer (X min restantes / objectif)
3. **Historique des sessions** : page `/sessions` avec liste et suppression individuelle

### Priorité basse
4. **Mobile** : l'app mobile Expo est fonctionnelle (bundle OK) mais le design ne correspond pas au web — styler les écrans mobile pour qu'ils ressemblent au thème dark navy/gold

---

## Points techniques importants

- **`turbopack.root`** dans `next.config.ts` pointe vers la racine du monorepo — nécessaire pour que Turbopack résolve `@vidaris/shared` en dev
- **`packageManager: "pnpm@10.33.3"`** dans le `package.json` racine — obligatoire pour que Vercel utilise pnpm
- **`apps/web/package-lock.json`** doit ne PAS exister (supprimé) — sinon Vercel détecte npm
- **CWD shell = `apps/web`** — utiliser `git -C /c/Users/pinau/Documents/Vidaris` pour toutes les commandes git
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
