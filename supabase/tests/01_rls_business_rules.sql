-- Testes de RLS e regras de negócio. Rode SOMENTE no Postgres local de teste
-- (depois de 00_local_supabase_mock.sql + migrations). Cria usuários fictícios.
\set ON_ERROR_STOP 0
\pset tuples_only on
-- Setup: two users via "signup" (trigger)
insert into auth.users (id, email, raw_user_meta_data) values
 ('aaaaaaaa-0000-4000-8000-000000000001','ana@test.com','{"name":"Ana Souza","age":"24","height":"165","weight":"60,5","goal":"perder_peso","fitness_level":"iniciante"}'),
 ('bbbbbbbb-0000-4000-8000-000000000002','bruno@test.com','{"name":"B","age":"abc","height":"9999","goal":"hack","fitness_level":"deus"}');
select 'T1 profile via trigger: ' || name || ' age=' || age || ' w=' || weight || ' goal=' || goal from profiles where id='aaaaaaaa-0000-4000-8000-000000000001';
select 'T2 invalid metadata sanitized: ' || name || ' age=' || coalesce(age::text,'null') || ' h=' || coalesce(height::text,'null') || ' goal=' || coalesce(goal,'null') || ' lvl=' || fitness_level from profiles where id='bbbbbbbb-0000-4000-8000-000000000002';

-- Act as Ana
set role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-0000-4000-8000-000000000001',false);
select 'T3 Ana sees profiles count (expect 1): ' || count(*) from profiles;
select 'T4 Ana sees catalog (expect 7): ' || count(*) from training_catalog;
update profiles set name='Ana S.' where id='aaaaaaaa-0000-4000-8000-000000000001';
select 'T5 Ana updated own name: ' || name from profiles;
\echo 'T6 Ana tries to set own XP (expect permission denied):'
update profiles set xp=99999 where id='aaaaaaaa-0000-4000-8000-000000000001';
\echo 'T7 Ana tries to update Bruno (expect UPDATE 0):'
\pset tuples_only off
update profiles set name='hacked' where id='bbbbbbbb-0000-4000-8000-000000000002';
\pset tuples_only on
\echo 'T8 Ana tries direct session insert (expect permission denied):'
insert into training_sessions (user_id, training_id, xp_earned) values ('aaaaaaaa-0000-4000-8000-000000000001','11111111-1111-4111-8111-000000000001',5000);
\echo 'T9 Ana tries to edit catalog (expect permission denied):'
update training_catalog set xp_reward=1000;
select 'T10 complete_training: ' || complete_training('11111111-1111-4111-8111-000000000002')::text;
\echo 'T11 same workout again within 60s (expect error):'
select complete_training('11111111-1111-4111-8111-000000000002');
select 'T12 different workout: ' || (complete_training('11111111-1111-4111-8111-000000000006')->>'xp');
\echo 'T13 nonexistent workout (expect error):'
select complete_training('99999999-9999-4999-8999-999999999999');
select 'T14 profile now: xp=' || xp || ' total=' || total_workouts from profiles;
select 'T15 stats: ' || get_user_stats('America/Sao_Paulo')::text;
\echo 'T16 bad tz falls back:'
select get_user_stats('Mars/Olympus')->>'streak_days';

-- Act as Bruno
select set_config('request.jwt.claim.sub','bbbbbbbb-0000-4000-8000-000000000002',false);
select 'T17 Bruno sees Ana sessions (expect 0): ' || count(*) from training_sessions;
select 'T18 Bruno sees profiles (expect only own "B"): ' || string_agg(name, ',') from profiles;
\echo 'T19 Bruno storage upload in Ana folder (expect RLS violation):'
insert into storage.objects (bucket_id, name) values ('avatars','aaaaaaaa-0000-4000-8000-000000000001/avatar.jpg');
insert into storage.objects (bucket_id, name) values ('avatars','bbbbbbbb-0000-4000-8000-000000000002/avatar.jpg');
select 'T20 Bruno upload own folder ok: ' || count(*) from storage.objects;

-- Anonymous
reset role; select set_config('request.jwt.claim.sub','',false);
set role anon;
\echo 'T21 anon reads catalog (expect permission denied):'
select count(*) from training_catalog;
\echo 'T22 anon completes training (expect permission denied):'
select complete_training('11111111-1111-4111-8111-000000000001');
reset role;

-- Streak: backdate sessions for Bruno (yesterday, 2 and 3 days ago, skip 4, then 5)
insert into training_sessions (user_id, training_id, xp_earned, completed_at) values
 ('bbbbbbbb-0000-4000-8000-000000000002','11111111-1111-4111-8111-000000000001',80, now() - interval '1 day'),
 ('bbbbbbbb-0000-4000-8000-000000000002','11111111-1111-4111-8111-000000000001',80, now() - interval '2 day'),
 ('bbbbbbbb-0000-4000-8000-000000000002','11111111-1111-4111-8111-000000000001',80, now() - interval '3 day'),
 ('bbbbbbbb-0000-4000-8000-000000000002','11111111-1111-4111-8111-000000000001',80, now() - interval '5 day');
set role authenticated;
select set_config('request.jwt.claim.sub','bbbbbbbb-0000-4000-8000-000000000002',false);
select 'T23 Bruno streak without training today (expect 3): ' || (get_user_stats()->>'streak_days');
select 'T24 after training today (expect 4): ' || (complete_training('11111111-1111-4111-8111-000000000007')->>'xp') || ' streak=' || (get_user_stats()->>'streak_days');
reset role;
select 'T25 levels 0,99,100,299,300,600,1000,1500: ' || string_agg(level_from_xp(x)::text, ',') from unnest(array[0,99,100,299,300,600,1000,1500]) x;
