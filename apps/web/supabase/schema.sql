create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  weekly_goal integer not null default 420,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  duration integer not null default 0,
  started_at timestamptz not null,
  created_at timestamptz not null default now(),
  mode text not null check (mode in ('chrono', 'pomodoro'))
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  unique (user_id, friend_id),
  check (user_id <> friend_id)
);

alter table public.users enable row level security;
alter table public.subjects enable row level security;
alter table public.sessions enable row level security;
alter table public.friendships enable row level security;

create policy "Users can read own mirror"
  on public.users for select
  using (id = auth.uid());

create policy "Users can insert own mirror"
  on public.users for insert
  with check (id = auth.uid());

create policy "Users can update own mirror"
  on public.users for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users can read own subjects"
  on public.subjects for select
  using (user_id = auth.uid());

create policy "Users can insert own subjects"
  on public.subjects for insert
  with check (user_id = auth.uid());

create policy "Users can update own subjects"
  on public.subjects for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own subjects"
  on public.subjects for delete
  using (user_id = auth.uid());

create policy "Users can read own sessions"
  on public.sessions for select
  using (user_id = auth.uid());

create policy "Users can insert own sessions"
  on public.sessions for insert
  with check (user_id = auth.uid());

create policy "Users can update own sessions"
  on public.sessions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own sessions"
  on public.sessions for delete
  using (user_id = auth.uid());

create policy "Users can read their friendships"
  on public.friendships for select
  using (user_id = auth.uid() or friend_id = auth.uid());

create policy "Users can request friendships"
  on public.friendships for insert
  with check (user_id = auth.uid());

create policy "Users can update their friendships"
  on public.friendships for update
  using (user_id = auth.uid() or friend_id = auth.uid())
  with check (user_id = auth.uid() or friend_id = auth.uid());

create policy "Users can delete their friendships"
  on public.friendships for delete
  using (user_id = auth.uid() or friend_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
