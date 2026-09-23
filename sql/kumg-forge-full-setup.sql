-- ============================================================
-- KUMG Forge — Full Database Setup (v7, final)
-- Includes: admin, DOB, AI chat + AI images, payments,
--           strict RLS, storage, backfill
-- Safe to run multiple times
-- ============================================================

-- === CLEAN RESET (correct dependency order) ===
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists profiles_touch_updated_at on profiles;
drop trigger if exists projects_touch_updated_at on projects;
drop trigger if exists profiles_check_dob on profiles;

drop table if exists ai_images cascade;
drop table if exists ai_messages cascade;
drop table if exists payments cascade;
drop table if exists projects cascade;
drop table if exists profiles cascade;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.touch_updated_at() cascade;
drop function if exists public.published_count(uuid) cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.check_dob() cascade;
drop function if exists public.ai_messages_today(uuid) cascade;
drop function if exists public.ai_images_today(uuid) cascade;


-- ============================================================
-- 1. PROFILES
-- ============================================================
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  email text unique,
  plan text default 'free' check (plan in ('free','pro','studio')),
  subdomain text unique,
  bio text default '',
  avatar_url text,
  dob date,
  age_verified boolean default false,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


-- ============================================================
-- 2. PROJECTS
-- ============================================================
create table projects (
  id uuid primary key default gen_random_uuid(),
  owner uuid references profiles(id) on delete cascade,
  name text not null,
  html text default '',
  css text default '',
  js text default '',
  is_published boolean default false,
  subdomain text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index projects_owner_idx on projects(owner);
create index projects_subdomain_idx on projects(subdomain) where is_published = true;


-- ============================================================
-- 3. PAYMENTS
-- ============================================================
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  reference text unique not null,
  poll_url text,
  amount decimal(10,2) not null,
  currency text default 'USD',
  plan text default 'pro',
  status text default 'pending' check (status in ('pending','paid','failed','cancelled')),
  created_at timestamptz default now(),
  paid_at timestamptz
);

create index payments_user_idx on payments(user_id);
create index payments_reference_idx on payments(reference);


-- ============================================================
-- 4. AI MESSAGES
-- ============================================================
create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index ai_messages_user_date_idx on ai_messages(user_id, created_at desc);


-- ============================================================
-- 5. AI IMAGES
-- ============================================================
create table ai_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  prompt text not null,
  created_at timestamptz default now()
);

create index ai_images_user_date_idx on ai_images(user_id, created_at desc);


-- ============================================================
-- 6. HELPER: is_admin()
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;


-- ============================================================
-- 7. HELPER: ai_messages_today()
-- ============================================================
create or replace function public.ai_messages_today(uid uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from ai_messages
  where user_id = uid
    and role = 'user'
    and created_at >= current_date;
$$;


-- ============================================================
-- 8. HELPER: ai_images_today()
-- ============================================================
create or replace function public.ai_images_today(uid uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from ai_images
  where user_id = uid
    and created_at >= current_date;
$$;


-- ============================================================
-- 9. HELPER: published_count()
-- ============================================================
create or replace function public.published_count(uid uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from projects
  where owner = uid and is_published = true;
$$;


-- ============================================================
-- 10. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();


-- ============================================================
-- 11. AUTO-UPDATE updated_at
-- ============================================================
create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on profiles
for each row execute procedure public.touch_updated_at();

create trigger projects_touch_updated_at
before update on projects
for each row execute procedure public.touch_updated_at();


-- ============================================================
-- 12. AGE VERIFICATION (13+)
-- ============================================================
create function public.check_dob()
returns trigger
language plpgsql
as $$
declare
  d date;
begin
  d := new.dob;
  if d is null then return new; end if;

  if (tg_op = 'UPDATE' and new.dob is not distinct from old.dob) then
    return new;
  end if;

  if d < '1900-01-01'::date then
    raise exception 'Please enter a valid date of birth.';
  end if;

  if d > (current_date - interval '13 years') then
    raise exception 'You must be at least 13 years old to use KUMG Forge.';
  end if;

  new.age_verified := true;
  return new;
end;
$$;

create trigger profiles_check_dob
before insert or update on public.profiles
for each row execute procedure public.check_dob();


-- ============================================================
-- 13. ROW LEVEL SECURITY
-- ============================================================
alter table profiles    enable row level security;
alter table projects    enable row level security;
alter table payments    enable row level security;
alter table ai_messages enable row level security;
alter table ai_images   enable row level security;

-- PROFILES
drop policy if exists "own profile read" on profiles;
drop policy if exists "own profile update" on profiles;
drop policy if exists "admin read all profiles" on profiles;

create policy "own profile read" on profiles
  for select using (auth.uid() = id);

create policy "own profile update" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "admin read all profiles" on profiles
  for select using (public.is_admin());

-- PROJECTS
drop policy if exists "own projects" on projects;
drop policy if exists "admin read all projects" on projects;
drop policy if exists "public can read published projects" on projects;

create policy "own projects" on projects
  for all using (auth.uid() = owner) with check (auth.uid() = owner);

create policy "admin read all projects" on projects
  for select using (public.is_admin());

create policy "public can read published projects" on projects
  for select using (is_published = true);

-- PAYMENTS
drop policy if exists "own payments" on payments;
drop policy if exists "admin read all payments" on payments;

create policy "own payments" on payments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "admin read all payments" on payments
  for select using (public.is_admin());

-- AI MESSAGES
drop policy if exists "own ai messages" on ai_messages;
drop policy if exists "admin read all ai messages" on ai_messages;

create policy "own ai messages" on ai_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "admin read all ai messages" on ai_messages
  for select using (public.is_admin());

-- AI IMAGES
drop policy if exists "own ai images" on ai_images;
drop policy if exists "admin read all ai images" on ai_images;

create policy "own ai images" on ai_images
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "admin read all ai images" on ai_images
  for select using (public.is_admin());


-- ============================================================
-- 14. STORAGE BUCKET FOR AVATARS
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "avatar public read" on storage.objects;
create policy "avatar public read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatar user insert" on storage.objects;
create policy "avatar user insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatar user update" on storage.objects;
create policy "avatar user update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatar user delete" on storage.objects;
create policy "avatar user delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );


-- ============================================================
-- 15. AUTO-BACKFILL existing auth users
-- ============================================================
insert into public.profiles (id, username, email)
select
  u.id,
  split_part(u.email, '@', 1) || '_' || substr(u.id::text, 1, 4),
  u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;


-- ============================================================
-- 16. MAKE kumgtourryl@gmail.com THE ADMIN
-- ============================================================
update public.profiles
set is_admin = true
where email = 'kumgtourryl@gmail.com';


-- ============================================================
-- DONE. You should see "Success. No rows returned"
-- ============================================================
