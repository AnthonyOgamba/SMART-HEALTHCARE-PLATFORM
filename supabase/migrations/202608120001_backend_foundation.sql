-- Backend Phase 1: authentication-adjacent profile, settings, and consent foundation.

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  date_of_birth date,
  emergency_contact_name text,
  emergency_contact_relationship text,
  emergency_contact_phone text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_check check (char_length(btrim(full_name)) between 1 and 120),
  constraint profiles_phone_check check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$'),
  constraint profiles_emergency_phone_check check (
    emergency_contact_phone is null or emergency_contact_phone ~ '^\+[1-9][0-9]{7,14}$'
  ),
  constraint profiles_date_of_birth_check check (date_of_birth is null or date_of_birth <= current_date),
  constraint profiles_timezone_check check (char_length(btrim(timezone)) between 1 and 100)
);

create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  medication_reminders boolean not null default true,
  appointment_reminders boolean not null default true,
  critical_alerts boolean not null default true,
  ai_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  granted boolean not null,
  policy_version text not null,
  recorded_at timestamptz not null default now(),
  constraint consents_type_check check (
    consent_type in ('health_data', 'ai_processing', 'notifications')
  ),
  constraint consents_policy_version_check check (char_length(btrim(policy_version)) between 1 and 50)
);

create index consents_user_type_recorded_idx
  on public.consents (user_id, consent_type, recorded_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger user_settings_set_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  metadata_full_name text;
  metadata_phone text;
begin
  metadata_full_name := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
  metadata_phone := nullif(btrim(new.raw_user_meta_data ->> 'phone'), '');

  if metadata_full_name is null then
    metadata_full_name := split_part(coalesce(new.email, 'New user'), '@', 1);
  end if;

  if char_length(metadata_full_name) > 120 then
    metadata_full_name := left(metadata_full_name, 120);
  end if;

  if metadata_phone is not null and metadata_phone !~ '^\+[1-9][0-9]{7,14}$' then
    metadata_phone := null;
  end if;

  insert into public.profiles (user_id, full_name, phone)
  values (new.id, metadata_full_name, metadata_phone);

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.consents enable row level security;

create policy "profiles_select_own"
on public.profiles for select to authenticated
using ((select auth.uid()) = user_id);

create policy "profiles_update_own"
on public.profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "user_settings_select_own"
on public.user_settings for select to authenticated
using ((select auth.uid()) = user_id);

create policy "user_settings_update_own"
on public.user_settings for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "consents_select_own"
on public.consents for select to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.record_consent(
  p_consent_type text,
  p_granted boolean
)
returns public.consents
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid;
  inserted_consent public.consents;
  current_policy_version constant text := '2026-08';
begin
  caller_id := auth.uid();
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_consent_type is null or p_consent_type not in (
    'health_data', 'ai_processing', 'notifications'
  ) then
    raise exception 'Unsupported consent type' using errcode = '22023';
  end if;

  if p_granted is null then
    raise exception 'Consent decision is required' using errcode = '22004';
  end if;

  insert into public.consents (user_id, consent_type, granted, policy_version)
  values (caller_id, p_consent_type, p_granted, current_policy_version)
  returning * into inserted_consent;

  return inserted_consent;
end;
$$;

revoke all on function public.record_consent(text, boolean)
from public, anon;
grant execute on function public.record_consent(text, boolean) to authenticated;

revoke insert, update, delete on public.consents from anon, authenticated;
revoke all on public.profiles from anon, authenticated;
revoke all on public.user_settings from anon, authenticated;
grant select on public.consents to authenticated;
grant select on public.profiles to authenticated;
grant update (
  full_name,
  phone,
  date_of_birth,
  emergency_contact_name,
  emergency_contact_relationship,
  emergency_contact_phone,
  timezone
) on public.profiles to authenticated;
grant select on public.user_settings to authenticated;
grant update (
  medication_reminders,
  appointment_reminders,
  critical_alerts,
  ai_enabled
) on public.user_settings to authenticated;
