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
