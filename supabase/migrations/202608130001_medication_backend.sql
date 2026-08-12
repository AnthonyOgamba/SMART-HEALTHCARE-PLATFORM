-- Backend Phase 2: persistent medication management and deterministic dose logs.
-- Missed-dose grace period: 2 hours after scheduled_for. Change the interval in
-- public.refresh_missed_medication_logs() if product requirements change.

create table public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  dose text not null,
  instructions text,
  start_date date not null default current_date,
  end_date date,
  active boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint medications_name_check check (char_length(btrim(name)) between 1 and 160),
  constraint medications_dose_check check (char_length(btrim(dose)) between 1 and 120),
  constraint medications_instructions_check check (instructions is null or char_length(instructions) <= 2000),
  constraint medications_date_range_check check (end_date is null or end_date >= start_date),
  constraint medications_archive_check check (not active or archived_at is null)
);

create index medications_user_active_idx on public.medications (user_id, active);
create index medications_user_start_date_idx on public.medications (user_id, start_date);

create table public.medication_schedules (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications(id) on delete cascade,
  time_of_day time not null,
  timezone text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint medication_schedules_timezone_check check (char_length(btrim(timezone)) between 1 and 100),
  constraint medication_schedules_unique unique (medication_id, time_of_day, timezone)
);

create index medication_schedules_active_time_idx
  on public.medication_schedules (active, time_of_day) where active;

create table public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications(id) on delete cascade,
  schedule_id uuid references public.medication_schedules(id) on delete set null,
  scheduled_for timestamptz not null,
  status text not null default 'pending',
  recorded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint medication_logs_status_check check (status in ('pending', 'taken', 'skipped', 'missed')),
  constraint medication_logs_recorded_check check (
    (status = 'pending' and recorded_at is null)
    or (status in ('taken', 'skipped') and recorded_at is not null)
    or status = 'missed'
  )
);

create unique index medication_logs_schedule_occurrence_uidx
  on public.medication_logs (schedule_id, scheduled_for) where schedule_id is not null;
create index medication_logs_medication_scheduled_idx
  on public.medication_logs (medication_id, scheduled_for desc);
create index medication_logs_pending_idx
  on public.medication_logs (scheduled_for) where status = 'pending';

create trigger medications_set_updated_at before update on public.medications
for each row execute function public.set_updated_at();
create trigger medication_schedules_set_updated_at before update on public.medication_schedules
for each row execute function public.set_updated_at();
create trigger medication_logs_set_updated_at before update on public.medication_logs
for each row execute function public.set_updated_at();

alter table public.medications enable row level security;
alter table public.medication_schedules enable row level security;
alter table public.medication_logs enable row level security;

create policy "medications_select_own" on public.medications for select to authenticated
using ((select auth.uid()) = user_id);

create policy "medication_schedules_select_own" on public.medication_schedules for select to authenticated
using (exists (select 1 from public.medications m where m.id = medication_id and m.user_id = (select auth.uid())));

create policy "medication_logs_select_own" on public.medication_logs for select to authenticated
using (exists (select 1 from public.medications m where m.id = medication_id and m.user_id = (select auth.uid())));

revoke all on public.medications, public.medication_schedules, public.medication_logs from anon, authenticated;
grant select on public.medications, public.medication_schedules, public.medication_logs to authenticated;

create or replace function public.validate_schedule_values(p_times time[], p_timezone text)
returns void language plpgsql set search_path = '' as $$
begin
  if p_times is null or cardinality(p_times) = 0 then
    raise exception 'At least one schedule time is required' using errcode = '22023';
  end if;
  if cardinality(p_times) <> (select count(distinct value) from unnest(p_times) value) then
    raise exception 'Duplicate schedule times are not allowed' using errcode = '23505';
  end if;
  if p_timezone is null or not exists (select 1 from pg_catalog.pg_timezone_names where name = p_timezone) then
    raise exception 'Invalid timezone' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.create_medication(
  p_name text, p_dose text, p_instructions text, p_start_date date,
  p_end_date date, p_schedule_times time[], p_timezone text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); created public.medications;
begin
  if caller is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  perform public.validate_schedule_values(p_schedule_times, p_timezone);
  insert into public.medications (user_id, name, dose, instructions, start_date, end_date)
  values (caller, btrim(p_name), btrim(p_dose), nullif(btrim(p_instructions), ''), coalesce(p_start_date, current_date), p_end_date)
  returning * into created;
  insert into public.medication_schedules (medication_id, time_of_day, timezone)
  select created.id, value, p_timezone from unnest(p_schedule_times) value;
  return jsonb_build_object('medication', to_jsonb(created), 'schedules',
    (select coalesce(jsonb_agg(to_jsonb(s) order by s.time_of_day), '[]'::jsonb) from public.medication_schedules s where s.medication_id = created.id));
end;
$$;

create or replace function public.update_medication(
  p_medication_id uuid, p_name text, p_dose text, p_instructions text,
  p_start_date date, p_end_date date, p_schedule_times time[], p_timezone text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); updated public.medications;
begin
  if caller is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  perform public.validate_schedule_values(p_schedule_times, p_timezone);
  update public.medications set name = btrim(p_name), dose = btrim(p_dose),
    instructions = nullif(btrim(p_instructions), ''), start_date = p_start_date, end_date = p_end_date
  where id = p_medication_id and user_id = caller and active
  returning * into updated;
  if updated.id is null then raise exception 'Medication not found' using errcode = 'P0002'; end if;
  update public.medication_schedules set active = false
  where medication_id = updated.id and active
    and (time_of_day <> all(p_schedule_times) or timezone <> p_timezone);
  insert into public.medication_schedules (medication_id, time_of_day, timezone, active)
  select updated.id, value, p_timezone, true from unnest(p_schedule_times) value
  on conflict (medication_id, time_of_day, timezone) do update set active = true;
  return jsonb_build_object('medication', to_jsonb(updated), 'schedules',
    (select coalesce(jsonb_agg(to_jsonb(s) order by s.time_of_day), '[]'::jsonb) from public.medication_schedules s where s.medication_id = updated.id and s.active));
end;
$$;

create or replace function public.archive_medication(p_medication_id uuid)
returns public.medications language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); archived public.medications;
begin
  if caller is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  update public.medications set active = false, archived_at = coalesce(archived_at, now())
  where id = p_medication_id and user_id = caller returning * into archived;
  if archived.id is null then raise exception 'Medication not found' using errcode = 'P0002'; end if;
  update public.medication_schedules set active = false where medication_id = archived.id and active;
  return archived;
end;
$$;

create or replace function public.refresh_missed_medication_logs()
returns integer language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); changed integer;
begin
  if caller is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  update public.medication_logs l set status = 'missed'
  from public.medications m where l.medication_id = m.id and m.user_id = caller
    and l.status = 'pending' and l.scheduled_for + interval '2 hours' < now();
  get diagnostics changed = row_count; return changed;
end;
$$;

create or replace function public.ensure_medication_logs_for_date(p_date date)
returns integer language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); inserted integer;
begin
  if caller is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_date is null then raise exception 'Date is required' using errcode = '22004'; end if;
  insert into public.medication_logs (medication_id, schedule_id, scheduled_for)
  select m.id, s.id, (p_date + s.time_of_day) at time zone s.timezone
  from public.medications m join public.medication_schedules s on s.medication_id = m.id
  where m.user_id = caller and m.active and s.active and p_date >= m.start_date
    and (m.end_date is null or p_date <= m.end_date)
  on conflict (schedule_id, scheduled_for) where schedule_id is not null do nothing;
  get diagnostics inserted = row_count;
  perform public.refresh_missed_medication_logs();
  return inserted;
end;
$$;

create or replace function public.get_medications_for_date(p_date date)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); result jsonb;
begin
  if caller is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  perform public.ensure_medication_logs_for_date(p_date);
  select jsonb_build_object(
    'date', p_date,
    'summary', jsonb_build_object(
      'scheduled', count(*), 'taken', count(*) filter (where l.status = 'taken'),
      'skipped', count(*) filter (where l.status = 'skipped'), 'missed', count(*) filter (where l.status = 'missed'),
      'pending', count(*) filter (where l.status = 'pending')),
    'items', coalesce(jsonb_agg(jsonb_build_object(
      'medication', to_jsonb(m), 'schedule', to_jsonb(s), 'log', to_jsonb(l)) order by l.scheduled_for), '[]'::jsonb)
  ) into result
  from public.medication_logs l join public.medications m on m.id = l.medication_id
  left join public.medication_schedules s on s.id = l.schedule_id
  where m.user_id = caller and l.scheduled_for >= p_date::timestamp at time zone coalesce(s.timezone, 'UTC')
    and l.scheduled_for < (p_date + 1)::timestamp at time zone coalesce(s.timezone, 'UTC');
  return result;
end;
$$;

create or replace function public.get_medication_details(p_medication_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); med public.medications; result jsonb;
begin
  if caller is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select * into med from public.medications where id = p_medication_id and user_id = caller;
  if med.id is null then raise exception 'Medication not found' using errcode = 'P0002'; end if;
  perform public.refresh_missed_medication_logs();
  select jsonb_build_object('medication', to_jsonb(med),
    'schedules', (select coalesce(jsonb_agg(to_jsonb(s) order by s.time_of_day), '[]'::jsonb) from public.medication_schedules s where s.medication_id = med.id and s.active),
    'nextLog', (select to_jsonb(l) from public.medication_logs l where l.medication_id = med.id and l.status = 'pending' order by l.scheduled_for limit 1),
    'adherence', (select jsonb_build_object('scheduled', count(*), 'taken', count(*) filter (where status='taken'),
      'skipped', count(*) filter (where status='skipped'), 'missed', count(*) filter (where status='missed'),
      'pending', count(*) filter (where status='pending'),
      'percentage', coalesce(round(100.0 * count(*) filter (where status='taken') / nullif(count(*) filter (where status <> 'pending'), 0), 1), 0))
      from public.medication_logs where medication_id = med.id and scheduled_for >= now() - interval '30 days')) into result;
  return result;
end;
$$;

create or replace function public.record_medication_status(p_log_id uuid, p_status text)
returns public.medication_logs language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); current_log public.medication_logs; changed public.medication_logs;
begin
  if caller is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_status not in ('taken', 'skipped') then raise exception 'Only taken or skipped may be recorded' using errcode = '22023'; end if;
  select l.* into current_log from public.medication_logs l join public.medications m on m.id=l.medication_id
    where l.id=p_log_id and m.user_id=caller for update of l;
  if current_log.id is null then raise exception 'Medication log not found' using errcode = 'P0002'; end if;
  if current_log.status = p_status then return current_log; end if;
  if current_log.status <> 'pending' then raise exception 'Medication log is already finalized' using errcode = '23505'; end if;
  update public.medication_logs set status=p_status, recorded_at=now() where id=p_log_id returning * into changed;
  return changed;
end;
$$;

create or replace function public.get_medication_history(p_from date, p_to date, p_medication_id uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); result jsonb;
begin
  if caller is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 366 then
    raise exception 'Invalid date range' using errcode = '22023';
  end if;
  if p_medication_id is not null and not exists (select 1 from public.medications where id=p_medication_id and user_id=caller) then
    raise exception 'Medication not found' using errcode = 'P0002';
  end if;
  perform public.refresh_missed_medication_logs();
  select jsonb_build_object(
    'entries', coalesce(jsonb_agg(jsonb_build_object('id',l.id,'medicationId',m.id,'medicationName',m.name,
      'dose',m.dose,'scheduledFor',l.scheduled_for,'status',l.status,'recordedAt',l.recorded_at) order by l.scheduled_for desc), '[]'::jsonb),
    'summary', jsonb_build_object('scheduled',count(*),'taken',count(*) filter(where l.status='taken'),
      'skipped',count(*) filter(where l.status='skipped'),'missed',count(*) filter(where l.status='missed'),
      'pending',count(*) filter(where l.status='pending'),
      'percentage',coalesce(round(100.0*count(*) filter(where l.status='taken')/nullif(count(*) filter(where l.status<>'pending'),0),1),0))
  ) into result from public.medication_logs l join public.medications m on m.id=l.medication_id
  where m.user_id=caller and (p_medication_id is null or m.id=p_medication_id)
    and l.scheduled_for >= p_from::timestamptz and l.scheduled_for < (p_to+1)::timestamptz;
  return result;
end;
$$;

create or replace function public.get_active_medications()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); result jsonb;
begin
  if caller is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('medication', to_jsonb(m), 'schedules',
    (select coalesce(jsonb_agg(to_jsonb(s) order by s.time_of_day), '[]'::jsonb)
     from public.medication_schedules s where s.medication_id=m.id and s.active)) order by m.name), '[]'::jsonb)
  into result from public.medications m where m.user_id=caller and m.active
    and current_date >= m.start_date and (m.end_date is null or current_date <= m.end_date);
  return result;
end;
$$;

revoke execute on function public.validate_schedule_values(time[], text) from public, anon, authenticated;
revoke execute on function public.create_medication(text,text,text,date,date,time[],text) from public, anon;
revoke execute on function public.update_medication(uuid,text,text,text,date,date,time[],text) from public, anon;
revoke execute on function public.archive_medication(uuid) from public, anon;
revoke execute on function public.refresh_missed_medication_logs() from public, anon;
revoke execute on function public.ensure_medication_logs_for_date(date) from public, anon;
revoke execute on function public.get_medications_for_date(date) from public, anon;
revoke execute on function public.get_medication_details(uuid) from public, anon;
revoke execute on function public.record_medication_status(uuid,text) from public, anon;
revoke execute on function public.get_medication_history(date,date,uuid) from public, anon;
revoke execute on function public.get_active_medications() from public, anon;
grant execute on function public.create_medication(text,text,text,date,date,time[],text) to authenticated;
grant execute on function public.update_medication(uuid,text,text,text,date,date,time[],text) to authenticated;
grant execute on function public.archive_medication(uuid) to authenticated;
grant execute on function public.refresh_missed_medication_logs() to authenticated;
grant execute on function public.ensure_medication_logs_for_date(date) to authenticated;
grant execute on function public.get_medications_for_date(date) to authenticated;
grant execute on function public.get_medication_details(uuid) to authenticated;
grant execute on function public.record_medication_status(uuid,text) to authenticated;
grant execute on function public.get_medication_history(date,date,uuid) to authenticated;
grant execute on function public.get_active_medications() to authenticated;
