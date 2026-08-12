-- Minimize SECURITY DEFINER use while preserving RPC-only medication writes.

create or replace function public.get_medications_for_date(p_date date)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  caller uuid := auth.uid();
  result jsonb;
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_date is null then
    raise exception 'Date is required' using errcode = '22004';
  end if;
  select jsonb_build_object(
    'date', p_date,
    'summary', jsonb_build_object(
      'scheduled', count(*),
      'taken', count(*) filter (where l.status = 'taken'),
      'skipped', count(*) filter (where l.status = 'skipped'),
      'missed', count(*) filter (where l.status = 'missed'),
      'pending', count(*) filter (where l.status = 'pending')
    ),
    'items', coalesce(jsonb_agg(jsonb_build_object(
      'medication', to_jsonb(m),
      'schedule', to_jsonb(s),
      'log', to_jsonb(l)
    ) order by l.scheduled_for), '[]'::jsonb)
  ) into result
  from public.medication_logs l
  join public.medications m on m.id = l.medication_id
  left join public.medication_schedules s on s.id = l.schedule_id
  where l.scheduled_for >= p_date::timestamp at time zone coalesce(s.timezone, 'UTC')
    and l.scheduled_for < (p_date + 1)::timestamp at time zone coalesce(s.timezone, 'UTC');
  return result;
end;
$$;

create or replace function public.get_medication_details(p_medication_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  caller uuid := auth.uid();
  med public.medications;
  result jsonb;
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_medication_id is null then
    raise exception 'Medication ID is required' using errcode = '22004';
  end if;
  select * into med from public.medications where id = p_medication_id;
  if med.id is null then
    raise exception 'Medication not found' using errcode = 'P0002';
  end if;
  select jsonb_build_object(
    'medication', to_jsonb(med),
    'schedules', (
      select coalesce(jsonb_agg(to_jsonb(s) order by s.time_of_day), '[]'::jsonb)
      from public.medication_schedules s
      where s.medication_id = med.id and s.active
    ),
    'nextLog', (
      select to_jsonb(l) from public.medication_logs l
      where l.medication_id = med.id and l.status = 'pending'
      order by l.scheduled_for limit 1
    ),
    'adherence', (
      select jsonb_build_object(
        'scheduled', count(*),
        'taken', count(*) filter (where status = 'taken'),
        'skipped', count(*) filter (where status = 'skipped'),
        'missed', count(*) filter (where status = 'missed'),
        'pending', count(*) filter (where status = 'pending'),
        'percentage', coalesce(round(
          100.0 * count(*) filter (where status = 'taken')
          / nullif(count(*) filter (where status <> 'pending'), 0), 1
        ), 0)
      ) from public.medication_logs where medication_id = med.id
        and scheduled_for >= now() - interval '30 days'
    )
  ) into result;
  return result;
end;
$$;

create or replace function public.get_medication_history(
  p_from date,
  p_to date,
  p_medication_id uuid default null
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  caller uuid := auth.uid();
  result jsonb;
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 366 then
    raise exception 'Invalid date range' using errcode = '22023';
  end if;
  if p_medication_id is not null
    and not exists (select 1 from public.medications where id = p_medication_id) then
    raise exception 'Medication not found' using errcode = 'P0002';
  end if;
  select jsonb_build_object(
    'entries', coalesce(jsonb_agg(jsonb_build_object(
      'id', l.id,
      'medicationId', m.id,
      'medicationName', m.name,
      'dose', m.dose,
      'scheduledFor', l.scheduled_for,
      'status', l.status,
      'recordedAt', l.recorded_at
    ) order by l.scheduled_for desc), '[]'::jsonb),
    'summary', jsonb_build_object(
      'scheduled', count(*),
      'taken', count(*) filter (where l.status = 'taken'),
      'skipped', count(*) filter (where l.status = 'skipped'),
      'missed', count(*) filter (where l.status = 'missed'),
      'pending', count(*) filter (where l.status = 'pending'),
      'percentage', coalesce(round(
        100.0 * count(*) filter (where l.status = 'taken')
        / nullif(count(*) filter (where l.status <> 'pending'), 0), 1
      ), 0)
    )
  ) into result
  from public.medication_logs l
  join public.medications m on m.id = l.medication_id
  where (p_medication_id is null or m.id = p_medication_id)
    and l.scheduled_for >= p_from::timestamptz
    and l.scheduled_for < (p_to + 1)::timestamptz;
  return result;
end;
$$;

create or replace function public.get_active_medications()
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  caller uuid := auth.uid();
  result jsonb;
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'medication', to_jsonb(m),
    'schedules', (
      select coalesce(jsonb_agg(to_jsonb(s) order by s.time_of_day), '[]'::jsonb)
      from public.medication_schedules s
      where s.medication_id = m.id and s.active
    )
  ) order by m.name), '[]'::jsonb)
  into result
  from public.medications m
  where m.active and current_date >= m.start_date
    and (m.end_date is null or current_date <= m.end_date);
  return result;
end;
$$;

-- Trigger helpers are never application RPCs.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.validate_schedule_values(time[], text) from public, anon, authenticated;

-- All application RPCs are denied by default and opened only to signed-in users.
revoke execute on function public.record_consent(text, boolean) from public, anon;
revoke execute on function public.create_medication(text, text, text, date, date, time[], text, text) from public, anon;
revoke execute on function public.update_medication(uuid, text, text, text, date, date, time[], text, text) from public, anon;
revoke execute on function public.archive_medication(uuid) from public, anon;
revoke execute on function public.ensure_medication_logs_for_date(date) from public, anon;
revoke execute on function public.refresh_missed_medication_logs() from public, anon;
revoke execute on function public.record_medication_status(uuid, text) from public, anon;
revoke execute on function public.get_medications_for_date(date) from public, anon;
revoke execute on function public.get_medication_details(uuid) from public, anon;
revoke execute on function public.get_medication_history(date, date, uuid) from public, anon;
revoke execute on function public.get_active_medications() from public, anon;

grant execute on function public.record_consent(text, boolean) to authenticated;
grant execute on function public.create_medication(text, text, text, date, date, time[], text, text) to authenticated;
grant execute on function public.update_medication(uuid, text, text, text, date, date, time[], text, text) to authenticated;
grant execute on function public.archive_medication(uuid) to authenticated;
grant execute on function public.ensure_medication_logs_for_date(date) to authenticated;
grant execute on function public.refresh_missed_medication_logs() to authenticated;
grant execute on function public.record_medication_status(uuid, text) to authenticated;
grant execute on function public.get_medications_for_date(date) to authenticated;
grant execute on function public.get_medication_details(uuid) to authenticated;
grant execute on function public.get_medication_history(date, date, uuid) to authenticated;
grant execute on function public.get_active_medications() to authenticated;
