-- Correct schedule edits without rewriting finalized medication history.

create or replace function public.update_medication(
  p_medication_id uuid,
  p_name text,
  p_dose text,
  p_instructions text,
  p_start_date date,
  p_end_date date,
  p_schedule_times time[],
  p_timezone text,
  p_reminder_sound text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  updated public.medications;
  removed_schedule_ids uuid[] := array[]::uuid[];
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  perform public.validate_schedule_values(p_schedule_times, p_timezone);

  update public.medications
  set name = btrim(p_name),
      dose = btrim(p_dose),
      instructions = nullif(btrim(p_instructions), ''),
      start_date = p_start_date,
      end_date = p_end_date,
      reminder_sound = coalesce(p_reminder_sound, 'default')
  where id = p_medication_id
    and user_id = caller
    and active
  returning * into updated;

  if updated.id is null then
    raise exception 'Medication not found' using errcode = 'P0002';
  end if;

  with deactivated as (
    update public.medication_schedules
    set active = false
    where medication_id = updated.id
      and active
      and (time_of_day <> all(p_schedule_times) or timezone <> p_timezone)
    returning id
  )
  select coalesce(array_agg(id), array[]::uuid[])
  into removed_schedule_ids
  from deactivated;

  -- A removed time must disappear from today's schedule when its occurrence
  -- is still pending and in the future. Finalized and past logs are history.
  delete from public.medication_logs
  where schedule_id = any(removed_schedule_ids)
    and status = 'pending'
    and scheduled_for >= now();

  insert into public.medication_schedules (medication_id, time_of_day, timezone, active)
  select updated.id, value, p_timezone, true
  from unnest(p_schedule_times) value
  on conflict (medication_id, time_of_day, timezone)
  do update set active = true;

  return jsonb_build_object(
    'medication', to_jsonb(updated),
    'schedules', (
      select coalesce(jsonb_agg(to_jsonb(s) order by s.time_of_day), '[]'::jsonb)
      from public.medication_schedules s
      where s.medication_id = updated.id
        and s.active
    )
  );
end;
$$;

create or replace function public.ensure_medication_logs_for_date(p_date date)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  inserted integer;
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_date is null then
    raise exception 'Date is required' using errcode = '22004';
  end if;

  insert into public.medication_logs (medication_id, schedule_id, scheduled_for)
  select m.id,
         s.id,
         (p_date + s.time_of_day) at time zone s.timezone
  from public.medications m
  join public.medication_schedules s on s.medication_id = m.id
  where m.user_id = caller
    and m.active
    and s.active
    and p_date >= m.start_date
    and (m.end_date is null or p_date <= m.end_date)
    -- Do not create a retroactive dose that did not exist when it was due.
    and ((p_date + s.time_of_day) at time zone s.timezone) >= greatest(m.created_at, s.updated_at)
  on conflict (schedule_id, scheduled_for) where schedule_id is not null
  do nothing;

  get diagnostics inserted = row_count;
  perform public.refresh_missed_medication_logs();
  return inserted;
end;
$$;

revoke execute on function public.update_medication(uuid, text, text, text, date, date, time[], text, text)
from public, anon;
grant execute on function public.update_medication(uuid, text, text, text, date, date, time[], text, text)
to authenticated;

revoke execute on function public.ensure_medication_logs_for_date(date)
from public, anon;
grant execute on function public.ensure_medication_logs_for_date(date)
to authenticated;
