-- =====================================================================
-- FITTRACK · 003 · Row Level Security + privilégios por coluna
-- Regra: cada usuário só enxerga e altera os próprios dados.
-- XP e total de treinos NÃO podem ser alterados diretamente pelo cliente:
-- só mudam via função complete_training() (migration 004).
-- =====================================================================

alter table public.profiles           enable row level security;
alter table public.training_catalog   enable row level security;
alter table public.training_exercises enable row level security;
alter table public.training_sessions  enable row level security;

-- ------------------------------ profiles ------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Sem policy de DELETE: exclusão só ao remover a conta (cascade).

-- Privilégios por coluna: o cliente só pode escrever campos de perfil.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, name, age, height, weight, goal, fitness_level, avatar_url)
  on public.profiles to authenticated;
grant update (name, age, height, weight, goal, fitness_level, avatar_url)
  on public.profiles to authenticated;

-- -------------------------- catálogo (leitura) ------------------------
drop policy if exists "catalog_read_authenticated" on public.training_catalog;
create policy "catalog_read_authenticated" on public.training_catalog
  for select to authenticated
  using (true);

drop policy if exists "exercises_read_authenticated" on public.training_exercises;
create policy "exercises_read_authenticated" on public.training_exercises
  for select to authenticated
  using (true);

revoke all on public.training_catalog   from anon, authenticated;
revoke all on public.training_exercises from anon, authenticated;
grant select on public.training_catalog   to authenticated;
grant select on public.training_exercises to authenticated;

-- -------------------------- training_sessions -------------------------
drop policy if exists "sessions_select_own" on public.training_sessions;
create policy "sessions_select_own" on public.training_sessions
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Sem policy de INSERT/UPDATE/DELETE: registros são criados apenas pela
-- função complete_training(), que valida usuário, treino e XP.
revoke all on public.training_sessions from anon, authenticated;
grant select on public.training_sessions to authenticated;
