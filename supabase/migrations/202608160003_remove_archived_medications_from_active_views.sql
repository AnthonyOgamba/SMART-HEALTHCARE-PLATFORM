-- Remove archived medications from active Home and Care Schedule views while
-- preserving finalized medication history.

create or replace function public.archive_medication(p_medication_id uuid)
returns public.medications
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  archived public.medications;
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update public.medications
  set active = false,
      archived_at = coalesce(archived_at, now())
  where id = p_medication_id
    and user_id = caller
  returning * into archived;

  if archived.id is null then
    raise exception 'Medication not found' using errcode = 'P0002';
  end if;

  update public.medication_schedules
  set active = false
  where medication_id = archived.id
    and active;

  delete from public.medication_logs
  where medication_id = archived.id
    and status = 'pending';

  return archived;
end;
$$;

create or replace function public.get_medications_for_date(p_date date)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
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
  where m.active
    and l.scheduled_for >= p_date::timestamp at time zone coalesce(s.timezone, 'UTC')
    and l.scheduled_for < (p_date + 1)::timestamp at time zone coalesce(s.timezone, 'UTC');

  return result;
end;
$$;

create or replace function public.get_home_dashboard(
  p_day_start timestamptz,
  p_day_end timestamptz,
  p_now timestamptz
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare result jsonb;
begin
  if p_day_start is null or p_day_end is null or p_now is null or p_day_start >= p_day_end then
    raise exception 'Invalid dashboard time range' using errcode = '22023';
  end if;

  with medication_rows as (
    select l.id log_id,l.medication_id,m.name,m.dose,l.scheduled_for,l.status
    from public.medication_logs l join public.medications m on m.id=l.medication_id
    where m.active and l.scheduled_for>=p_day_start and l.scheduled_for<p_day_end
  ), medication_summary as (
    select count(*) filter(where scheduled_for<=p_now) due,
      count(*) filter(where scheduled_for<=p_now and status='taken') taken_due,
      count(*) filter(where scheduled_for>p_now) future_today,
      count(*) filter(where scheduled_for<=p_now and status='pending') overdue_pending
    from medication_rows
  ), activity_summary as (
    select coalesce(sum(duration_minutes) filter(where status='completed'),0) completed_minutes,
      coalesce(sum(duration_minutes) filter(where status='scheduled'),0) scheduled_minutes,
      count(*) filter(where status='completed') completed_count,
      count(*) filter(where status='scheduled') scheduled_count,
      coalesce(sum(steps) filter(where status='completed'),0) recorded_steps
    from public.activity_logs where started_at>=p_day_start and started_at<p_day_end
  ), activity_goal as (
    select daily_activity_goal_minutes goal from public.user_settings limit 1
  ), refill_candidates as (
    select m.id medication_id,m.name,m.refill_warning_days,
      m.supply_quantity/(m.units_per_dose*count(s.id)) estimated_days_remaining
    from public.medications m join public.medication_schedules s on s.medication_id=m.id and s.active
    where m.active and m.supply_quantity is not null and m.units_per_dose is not null
      and m.units_per_dose>0 and m.refill_warning_days is not null
    group by m.id,m.name,m.refill_warning_days,m.supply_quantity,m.units_per_dose
    having m.supply_quantity/(m.units_per_dose*count(s.id))<=m.refill_warning_days
  )
  select jsonb_build_object(
    'medications',jsonb_build_object(
      'due',ms.due,'taken_due',ms.taken_due,'future_today',ms.future_today,'overdue_pending',ms.overdue_pending,
      'progress_percentage',case when ms.due=0 then null else round(100.0*ms.taken_due/ms.due) end,
      'next',(select jsonb_build_object('log_id',log_id,'medication_id',medication_id,'name',name,'dose',dose,'scheduled_for',scheduled_for)
        from medication_rows where status='pending' and scheduled_for>=p_now order by scheduled_for limit 1)
    ),
    'appointment',(select jsonb_build_object('id',id,'title',title,'provider_name',provider_name,'practitioner_type',practitioner_type,'starts_at',starts_at,'location',location)
      from public.appointments where status='scheduled' and starts_at>=p_now order by starts_at limit 1),
    'activity',jsonb_build_object(
      'completed_minutes_today',a.completed_minutes,'scheduled_minutes_today',a.scheduled_minutes,
      'daily_goal_minutes',g.goal,'progress_percentage',case when g.goal is null then null else least(round(100.0*a.completed_minutes/g.goal),100) end,
      'completed_count',a.completed_count,'scheduled_count',a.scheduled_count,'recorded_steps_today',a.recorded_steps
    ),
    'sleep',(select jsonb_build_object('last_sleep_id',id,'sleep_start',sleep_start,'wake_time',wake_time,
      'duration_minutes',floor(extract(epoch from (wake_time-sleep_start))/60),'quality',quality)
      from public.sleep_logs where wake_time<=p_now order by wake_time desc limit 1),
    'refills',jsonb_build_object('warning_count',(select count(*) from refill_candidates),
      'most_urgent',(select jsonb_build_object('medication_id',medication_id,'name',name,'estimated_days_remaining',round(estimated_days_remaining,1),'refill_warning_days',refill_warning_days)
        from refill_candidates order by estimated_days_remaining limit 1)),
    'notifications',jsonb_build_object('unread_count',(select count(*) from public.notifications where read_at is null)),
    'today',jsonb_build_object('total_scheduled_items',
      (select count(*) from medication_rows)
      +(select count(*) from public.appointments where starts_at>=p_day_start and starts_at<p_day_end and status<>'cancelled')
      +(select count(*) from public.activity_logs where started_at>=p_day_start and started_at<p_day_end))
  ) into result from medication_summary ms cross join activity_summary a left join activity_goal g on true;

  return result;
end;
$$;

revoke execute on function public.archive_medication(uuid) from public, anon;
grant execute on function public.archive_medication(uuid) to authenticated;

revoke execute on function public.get_medications_for_date(date) from public, anon;
grant execute on function public.get_medications_for_date(date) to authenticated;

revoke execute on function public.get_home_dashboard(timestamptz, timestamptz, timestamptz) from public, anon;
grant execute on function public.get_home_dashboard(timestamptz, timestamptz, timestamptz) to authenticated;
