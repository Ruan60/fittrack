-- =====================================================================
-- FITTRACK · 001 · Schema
-- Tabelas: profiles, training_catalog, training_exercises, training_sessions
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- profiles: 1:1 com auth.users. Nunca armazena senha.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  name           text        not null check (char_length(trim(name)) between 2 and 80),
  age            integer     check (age between 12 and 100),
  height         numeric(5,1) check (height between 100 and 250),   -- cm
  weight         numeric(5,1) check (weight between 30 and 350),    -- kg
  goal           text        check (goal in ('perder_peso','ganhar_massa','condicionamento','saude')),
  fitness_level  text        not null default 'iniciante'
                             check (fitness_level in ('iniciante','intermediario','avancado')),
  avatar_url     text,
  xp             integer     not null default 0 check (xp >= 0),
  total_workouts integer     not null default 0 check (total_workouts >= 0),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.profiles is 'Dados de perfil do usuário autenticado (Supabase Auth cuida da senha).';

-- ---------------------------------------------------------------------
-- training_catalog: catálogo público (somente leitura para usuários)
-- ---------------------------------------------------------------------
create table if not exists public.training_catalog (
  id               uuid primary key default gen_random_uuid(),
  name             text    not null unique,
  description      text    not null,
  goal             text    not null check (goal in ('perder_peso','ganhar_massa','condicionamento','saude')),
  difficulty       text    not null check (difficulty in ('iniciante','intermediario','avancado')),
  duration_minutes integer not null check (duration_minutes between 5 and 180),
  xp_reward        integer not null default 100 check (xp_reward between 10 and 1000),
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- training_exercises: exercícios de cada treino
-- ---------------------------------------------------------------------
create table if not exists public.training_exercises (
  id               uuid primary key default gen_random_uuid(),
  training_id      uuid    not null references public.training_catalog (id) on delete cascade,
  name             text    not null,
  description      text,
  sets             integer check (sets between 1 and 20),
  repetitions      integer check (repetitions between 1 and 200),
  duration_seconds integer check (duration_seconds between 5 and 7200),
  order_index      integer not null default 0,
  unique (training_id, order_index)
);

create index if not exists training_exercises_training_idx
  on public.training_exercises (training_id, order_index);

-- ---------------------------------------------------------------------
-- training_sessions: treinos concluídos
-- ---------------------------------------------------------------------
create table if not exists public.training_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid    not null references public.profiles (id) on delete cascade,
  training_id  uuid    not null references public.training_catalog (id) on delete restrict,
  completed_at timestamptz not null default now(),
  xp_earned    integer not null check (xp_earned > 0)
);

create index if not exists training_sessions_user_idx
  on public.training_sessions (user_id, completed_at desc);

-- ---------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
