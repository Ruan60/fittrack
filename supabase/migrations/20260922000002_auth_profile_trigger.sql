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
