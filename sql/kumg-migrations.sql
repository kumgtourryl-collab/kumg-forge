-- ============================================================
-- KUMG FORGE — MIGRATIONS
-- ============================================================
--
-- WHAT THIS FILE IS
-- Every change to the database AFTER the initial fresh install goes here.
-- This file NEVER deletes user data. It only adds or updates.
--
-- HOW TO USE IT
--   1. When I send you a new migration block, append it to the bottom
--      of this file (below the last dated entry).
--   2. Save it in GitHub.
--   3. Run the WHOLE file in Supabase → SQL Editor → Run.
--   4. It is safe to run multiple times — every statement uses
--      "if not exists", "or replace", or "drop policy if exists".
--
-- THE GOLDEN RULE
--   Never write "drop table", "truncate", or "delete from" in this file.
--   Those kill user data. Only fresh-install.sql is allowed to drop tables.
--
-- ============================================================


-- ============================================================
-- 2026-09-28 — KUMG Invite (referral system)
-- ============================================================

alter table profiles add column if not exists referral_code text unique;
alter table profiles add column if not exists referred_by uuid references profiles(id) on delete set null;
alter table profiles add column if not exists referral_count int default 0;

create index if not exists profiles_referral_code_idx on profiles(referral_code);

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references profiles(id) on delete cascade,
  referred_id uuid references profiles(id) on delete cascade,
  status text default 'pending' check (status in ('pending','rewarded')),
  reward_cents int default 50,
  created_at timestamptz default now(),
  rewarded_at timestamptz,
  unique(referrer_id, referred_id)
);

create index if not exists referrals_referrer_idx on referrals(referrer_id, created_at desc);
create index if not exists referrals_referred_idx on referrals(referred_id);

alter table referrals enable row level security;

drop policy if exists "own referrals read" on referrals;
create policy "own referrals read" on referrals
  for select using (auth.uid() = referrer_id);

drop policy if exists "admin read all referrals" on referrals;
create policy "admin read all referrals" on referrals
  for select using (public.is_admin());

update profiles
set referral_code = lower(substr(md5(random()::text || id::text), 1, 6))
where referral_code is null;

create or replace function public.assign_referral_code()
returns trigger language plpgsql as $$
begin
  if new.referral_code is null then
    new.referral_code := lower(substr(md5(random()::text || new.id::text), 1, 6));
  end if;
  return new;
end;
$$;

drop trigger if exists assign_referral_code on profiles;
create trigger assign_referral_code
before insert on profiles
for each row execute procedure public.assign_referral_code();

create or replace function public.find_referrer(p_code text)
returns uuid language sql stable security definer set search_path = public
as $$
  select id from profiles where referral_code = lower(trim(p_code)) limit 1;
$$;

create or replace function public.process_referral(p_referred_id uuid)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  v_referrer uuid;
  v_existing uuid;
  v_amount int := 50;
begin
  select referred_by into v_referrer from profiles where id = p_referred_id;
  if v_referrer is null then
    return jsonb_build_object('ok', false, 'reason', 'no_referrer');
  end if;

  select id into v_existing from referrals
  where referrer_id = v_referrer and referred_id = p_referred_id;
  if v_existing is not null then
    return jsonb_build_object('ok', false, 'reason', 'already_rewarded');
  end if;

  insert into referrals (referrer_id, referred_id, status, reward_cents, rewarded_at)
  values (v_referrer, p_referred_id, 'rewarded', v_amount, now());

  update wallets
  set balance_cents = balance_cents + v_amount,
      lifetime_cents = lifetime_cents + v_amount,
      updated_at = now()
  where user_id = v_referrer;

  update profiles
  set referral_count = coalesce(referral_count, 0) + 1
  where id = v_referrer;

  return jsonb_build_object('ok', true, 'reward_cents', v_amount);
end;
$$;


-- ============================================================
-- MIGRATION TEMPLATE — copy for every new change
-- ============================================================
--
-- -- [YYYY-MM-DD] Short description of what this does
--
-- -- Add a column (safe, keeps existing data)
-- alter table profiles add column if not exists new_field text;
--
-- -- Add a table
-- create table if not exists new_table (
--   id uuid primary key default gen_random_uuid(),
--   user_id uuid references profiles(id) on delete cascade,
--   name text,
--   created_at timestamptz default now()
-- );
--
-- create index if not exists new_table_user_idx on new_table(user_id);
-- alter table new_table enable row level security;
--
-- drop policy if exists "own new table" on new_table;
-- create policy "own new table" on new_table
--   for all using (auth.uid() = user_id)
--   with check (auth.uid() = user_id);
--
-- -- Add a function
-- create or replace function public.new_helper()
-- returns int language sql stable security definer set search_path = public
-- as $$
--   select count(*)::int from new_table;
-- $$;
--
-- -- Add a trigger
-- drop trigger if exists new_trigger on new_table;
-- create trigger new_trigger
-- after insert on new_table
-- for each row execute procedure public.new_function();
--
-- ============================================================
