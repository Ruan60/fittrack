-- =====================================================================
-- FITTRACK · setup completo (todas as migrations em ordem)
-- Cole este arquivo inteiro no Supabase > SQL Editor e clique em Run.
-- Gerado a partir de supabase/migrations/*.sql. Pode rodar mais de uma vez.
-- =====================================================================

-- >>> 20260922000001_schema.sql
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

-- >>> 20260922000002_auth_profile_trigger.sql
-- =====================================================================
-- FITTRACK · 002 · Criação automática do perfil no cadastro
-- Os dados do formulário de cadastro chegam em raw_user_meta_data.
-- Funciona mesmo com confirmação de e-mail ligada (sem sessão ativa).
-- =====================================================================

-- Converte texto para número sem lançar erro (retorna null se inválido)
create or replace function public.try_numeric(v text)
returns numeric
language sql
immutable
as $$
  select case when v ~ '^\s*-?[0-9]+([.,][0-9]+)?\s*$'
              then replace(trim(v), ',', '.')::numeric
              else null end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  m        jsonb   := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_name   text    := nullif(trim(m ->> 'name'), '');
  v_age    numeric := public.try_numeric(m ->> 'age');
  v_height numeric := public.try_numeric(m ->> 'height');
  v_weight numeric := public.try_numeric(m ->> 'weight');
  v_goal   text    := m ->> 'goal';
  v_level  text    := m ->> 'fitness_level';
begin
  if v_name is null or char_length(v_name) < 2 then
    v_name := split_part(coalesce(new.email, 'Atleta'), '@', 1);
    if char_length(v_name) < 2 then v_name := 'Atleta'; end if;
  end if;

  insert into public.profiles (id, name, age, height, weight, goal, fitness_level)
  values (
    new.id,
    left(v_name, 80),
    case when v_age    between 12  and 100 then v_age::int end,
    case when v_height between 100 and 250 then round(v_height, 1) end,
    case when v_weight between 30  and 350 then round(v_weight, 1) end,
    case when v_goal  in ('perder_peso','ganhar_massa','condicionamento','saude') then v_goal end,
    case when v_level in ('iniciante','intermediario','avancado') then v_level else 'iniciante' end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- >>> 20260922000003_rls_policies.sql
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

-- >>> 20260922000004_functions.sql
-- =====================================================================
-- FITTRACK · 004 · Regras de negócio (RPC)
--   level_from_xp(xp)          -> nível calculado a partir do XP
--   complete_training(id, tz)  -> registra treino + XP de forma atômica
--   get_user_stats(tz)         -> XP, nível, treinos, semana, sequência
-- =====================================================================

-- Curva de nível: subir do nível N para N+1 custa N*100 XP.
-- XP acumulado para atingir o nível L = 50 * L * (L - 1)
-- Nível 1: 0 XP | 2: 100 | 3: 300 | 4: 600 | 5: 1000 | 6: 1500 ...
create or replace function public.level_from_xp(p_xp integer)
returns integer
language sql
immutable
as $$
  select greatest(1, floor((1 + sqrt(1 + greatest(p_xp, 0) / 12.5)) / 2)::int);
$$;

-- Intervalo mínimo entre duas conclusões do MESMO treino (anti clique duplo/spam)
create or replace function public.complete_training(
  p_training_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_xp_reward integer;
  v_name      text;
  v_old_xp    integer;
  v_new_xp    integer;
  v_total     integer;
  v_session   uuid;
  v_completed timestamptz;
begin
  if v_uid is null then
    raise exception 'Usuário não autenticado' using errcode = '42501';
  end if;

  select xp_reward, name into v_xp_reward, v_name
  from public.training_catalog
  where id = p_training_id;

  if v_xp_reward is null then
    raise exception 'Treino inexistente' using errcode = 'P0002';
  end if;

  -- Trava a linha do perfil: evita corrida entre cliques simultâneos
  select xp into v_old_xp
  from public.profiles
  where id = v_uid
  for update;

  if v_old_xp is null then
    raise exception 'Perfil não encontrado' using errcode = 'P0002';
  end if;

  if exists (
    select 1 from public.training_sessions
    where user_id = v_uid
      and training_id = p_training_id
      and completed_at > now() - interval '60 seconds'
  ) then
    raise exception 'Você acabou de concluir este treino. Aguarde um instante.'
      using errcode = 'P0001';
  end if;

  insert into public.training_sessions (user_id, training_id, xp_earned)
  values (v_uid, p_training_id, v_xp_reward)
  returning id, completed_at into v_session, v_completed;

  update public.profiles
     set xp = xp + v_xp_reward,
         total_workouts = total_workouts + 1
   where id = v_uid
  returning xp, total_workouts into v_new_xp, v_total;

  return jsonb_build_object(
    'session_id',     v_session,
    'training_name',  v_name,
    'completed_at',   v_completed,
    'xp_earned',      v_xp_reward,
    'xp',             v_new_xp,
    'total_workouts', v_total,
    'level',          public.level_from_xp(v_new_xp),
    'previous_level', public.level_from_xp(v_old_xp),
    'leveled_up',     public.level_from_xp(v_new_xp) > public.level_from_xp(v_old_xp)
  );
end;
$$;

-- Estatísticas do usuário logado. p_tz define o "dia" e a "semana" locais.
create or replace function public.get_user_stats(p_tz text default 'America/Sao_Paulo')
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_tz      text := coalesce(nullif(p_tz, ''), 'America/Sao_Paulo');
  v_today   date;
  v_xp      integer;
  v_total   integer;
  v_week    integer;
  v_streak  integer := 0;
  v_cursor  date;
  v_trained_today boolean;
begin
  if v_uid is null then
    raise exception 'Usuário não autenticado' using errcode = '42501';
  end if;

  -- Fuso inválido cai para o padrão
  if not exists (select 1 from pg_timezone_names where name = v_tz) then
    v_tz := 'America/Sao_Paulo';
  end if;

  v_today := (now() at time zone v_tz)::date;

  select xp, total_workouts into v_xp, v_total
  from public.profiles where id = v_uid;

  -- Semana começa na segunda-feira
  select count(*) into v_week
  from public.training_sessions
  where user_id = v_uid
    and (completed_at at time zone v_tz)::date >= date_trunc('week', v_today)::date;

  -- Sequência: dias consecutivos com treino, terminando hoje (ou ontem,
  -- se o usuário ainda não treinou hoje)
  select exists (
    select 1 from public.training_sessions
    where user_id = v_uid and (completed_at at time zone v_tz)::date = v_today
  ) into v_trained_today;

  v_cursor := case when v_trained_today then v_today else v_today - 1 end;

  loop
    exit when not exists (
      select 1 from public.training_sessions
      where user_id = v_uid and (completed_at at time zone v_tz)::date = v_cursor
    );
    v_streak := v_streak + 1;
    v_cursor := v_cursor - 1;
  end loop;

  return jsonb_build_object(
    'xp',             coalesce(v_xp, 0),
    'level',          public.level_from_xp(coalesce(v_xp, 0)),
    'total_workouts', coalesce(v_total, 0),
    'week_workouts',  v_week,
    'streak_days',    v_streak,
    'trained_today',  v_trained_today
  );
end;
$$;

revoke all on function public.complete_training(uuid) from public, anon;
revoke all on function public.get_user_stats(text)    from public, anon;
grant execute on function public.complete_training(uuid) to authenticated;
grant execute on function public.get_user_stats(text)    to authenticated;
grant execute on function public.level_from_xp(integer)  to authenticated;

-- Funções internas não devem ser chamadas pelo cliente
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- >>> 20260922000005_storage_avatars.sql
-- =====================================================================
-- FITTRACK · 005 · Storage para foto de perfil
-- Bucket público "avatars" (leitura por URL). Cada usuário só pode
-- enviar/alterar/remover arquivos dentro da pasta com o próprio id:
--   avatars/<user_id>/avatar-<timestamp>.jpg
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_insert_own_folder" on storage.objects;
create policy "avatars_insert_own_folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatars_update_own_folder" on storage.objects;
create policy "avatars_update_own_folder" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatars_delete_own_folder" on storage.objects;
create policy "avatars_delete_own_folder" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatars_select_own_folder" on storage.objects;
create policy "avatars_select_own_folder" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- >>> 20260922000006_seed_trainings.sql
-- =====================================================================
-- FITTRACK · 006 · Seed: catálogo inicial de treinos (idempotente)
-- =====================================================================

insert into public.training_catalog (id, name, description, goal, difficulty, duration_minutes, xp_reward) values
  ('11111111-1111-4111-8111-000000000001', 'Full Body Iniciante', 'Treino de corpo inteiro para criar base de força e aprender os movimentos fundamentais.', 'saude', 'iniciante', 35, 80),
  ('11111111-1111-4111-8111-000000000002', 'Peito e Tríceps', 'Foco em empurrar: peitoral, ombro anterior e tríceps com volume moderado.', 'ganhar_massa', 'intermediario', 50, 120),
  ('11111111-1111-4111-8111-000000000003', 'Costas e Bíceps', 'Foco em puxar: dorsais, trapézio e bíceps para postura e força.', 'ganhar_massa', 'intermediario', 50, 120),
  ('11111111-1111-4111-8111-000000000004', 'Pernas', 'Quadríceps, posteriores e glúteos. Treino pesado para membros inferiores.', 'ganhar_massa', 'avancado', 60, 160),
  ('11111111-1111-4111-8111-000000000005', 'Cardio Moderado', 'Sessão contínua para condicionamento aeróbico e gasto calórico.', 'perder_peso', 'iniciante', 30, 80),
  ('11111111-1111-4111-8111-000000000006', 'HIIT 20', 'Intervalado de alta intensidade: 40s de esforço, 20s de descanso.', 'condicionamento', 'avancado', 20, 140),
  ('11111111-1111-4111-8111-000000000007', 'Core e Mobilidade', 'Abdômen, lombar e mobilidade de quadril e ombros. Ótimo para dias leves.', 'saude', 'iniciante', 25, 70)
on conflict (id) do update set
  name = excluded.name, description = excluded.description, goal = excluded.goal,
  difficulty = excluded.difficulty, duration_minutes = excluded.duration_minutes, xp_reward = excluded.xp_reward;

insert into public.training_exercises (training_id, name, description, sets, repetitions, duration_seconds, order_index) values
  ('11111111-1111-4111-8111-000000000001', 'Agachamento livre', 'Pés na largura dos ombros, desça até a coxa ficar paralela ao chão.', 3, 12, null, 1),
  ('11111111-1111-4111-8111-000000000001', 'Flexão de braço (joelhos apoiados)', 'Mantenha o core firme e desça o peito até perto do chão.', 3, 10, null, 2),
  ('11111111-1111-4111-8111-000000000001', 'Remada com halter', 'Apoie uma mão no banco e puxe o halter até a lateral do tronco.', 3, 12, null, 3),
  ('11111111-1111-4111-8111-000000000001', 'Afundo alternado', 'Passo à frente, joelho de trás quase tocando o chão.', 3, 10, null, 4),
  ('11111111-1111-4111-8111-000000000001', 'Prancha frontal', 'Corpo alinhado da cabeça aos calcanhares.', 3, null, 30, 5),
  ('11111111-1111-4111-8111-000000000002', 'Supino reto com barra', 'Escápulas retraídas, barra descendo até a linha do peito.', 4, 10, null, 1),
  ('11111111-1111-4111-8111-000000000002', 'Supino inclinado com halteres', 'Banco a 30°, controle a descida.', 3, 12, null, 2),
  ('11111111-1111-4111-8111-000000000002', 'Crucifixo na máquina', 'Movimento amplo, pausa de 1s no pico.', 3, 12, null, 3),
  ('11111111-1111-4111-8111-000000000002', 'Mergulho no banco', 'Cotovelos apontando para trás.', 3, 12, null, 4),
  ('11111111-1111-4111-8111-000000000002', 'Tríceps na polia com corda', 'Abra a corda no final do movimento.', 3, 15, null, 5),
  ('11111111-1111-4111-8111-000000000003', 'Puxada frontal', 'Puxe a barra até o queixo, peito aberto.', 4, 10, null, 1),
  ('11111111-1111-4111-8111-000000000003', 'Remada curvada com barra', 'Tronco a 45°, puxe a barra até o umbigo.', 4, 10, null, 2),
  ('11111111-1111-4111-8111-000000000003', 'Remada baixa na polia', 'Coluna neutra, cotovelos rentes ao corpo.', 3, 12, null, 3),
  ('11111111-1111-4111-8111-000000000003', 'Rosca direta com barra', 'Sem balançar o tronco.', 3, 12, null, 4),
  ('11111111-1111-4111-8111-000000000003', 'Rosca martelo', 'Pegada neutra, alternando os braços.', 3, 12, null, 5),
  ('11111111-1111-4111-8111-000000000004', 'Agachamento com barra', 'Profundidade completa com coluna neutra.', 5, 8, null, 1),
  ('11111111-1111-4111-8111-000000000004', 'Leg press 45°', 'Pés na largura do quadril, sem travar os joelhos.', 4, 12, null, 2),
  ('11111111-1111-4111-8111-000000000004', 'Stiff com barra', 'Quadril para trás, barra rente às pernas.', 4, 10, null, 3),
  ('11111111-1111-4111-8111-000000000004', 'Cadeira extensora', 'Pausa de 1s com a perna estendida.', 3, 15, null, 4),
  ('11111111-1111-4111-8111-000000000004', 'Mesa flexora', 'Controle a volta em 3 segundos.', 3, 12, null, 5),
  ('11111111-1111-4111-8111-000000000004', 'Panturrilha em pé', 'Amplitude total, pausa no topo.', 4, 15, null, 6),
  ('11111111-1111-4111-8111-000000000005', 'Aquecimento na esteira', 'Caminhada leve.', null, null, 300, 1),
  ('11111111-1111-4111-8111-000000000005', 'Corrida leve', 'Ritmo em que ainda é possível conversar.', null, null, 1200, 2),
  ('11111111-1111-4111-8111-000000000005', 'Bicicleta ergométrica', 'Carga moderada, cadência constante.', null, null, 480, 3),
  ('11111111-1111-4111-8111-000000000005', 'Desaquecimento', 'Caminhada lenta e respiração controlada.', null, null, 180, 4),
  ('11111111-1111-4111-8111-000000000006', 'Burpee', 'Explosão no salto, peito no chão na descida.', 4, null, 40, 1),
  ('11111111-1111-4111-8111-000000000006', 'Mountain climber', 'Joelhos rápidos em direção ao peito.', 4, null, 40, 2),
  ('11111111-1111-4111-8111-000000000006', 'Agachamento com salto', 'Aterrisse suave e emende a próxima repetição.', 4, null, 40, 3),
  ('11111111-1111-4111-8111-000000000006', 'Polichinelo', 'Ritmo alto e constante.', 4, null, 40, 4),
  ('11111111-1111-4111-8111-000000000006', 'Prancha com toque no ombro', 'Quadril estável durante o toque.', 4, null, 40, 5),
  ('11111111-1111-4111-8111-000000000007', 'Gato-camelo', 'Mobilize a coluna devagar, vértebra por vértebra.', 2, 10, null, 1),
  ('11111111-1111-4111-8111-000000000007', 'Dead bug', 'Lombar colada no chão, braço e perna opostos.', 3, 10, null, 2),
  ('11111111-1111-4111-8111-000000000007', 'Ponte de glúteo', 'Contraia o glúteo no topo por 2s.', 3, 15, null, 3),
  ('11111111-1111-4111-8111-000000000007', 'Prancha lateral', 'Quadril alto, corpo alinhado.', 3, null, 30, 4),
  ('11111111-1111-4111-8111-000000000007', 'Alongamento de flexores do quadril', 'Posição de afundo, quadril para frente.', 2, null, 45, 5)
on conflict (training_id, order_index) do update set
  name = excluded.name, description = excluded.description, sets = excluded.sets,
  repetitions = excluded.repetitions, duration_seconds = excluded.duration_seconds;
