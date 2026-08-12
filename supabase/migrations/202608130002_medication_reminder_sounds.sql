-- Store a portable logical reminder sound. Device notification identifiers remain local-only.

alter table public.medications
  add column reminder_sound text not null default 'default',
  add constraint medications_reminder_sound_check check (
    reminder_sound in (
      'default',
      'gentle_chime',
      'soft_bell',
      'bright_alert',
      'calm_tone',
      'classic_reminder'
    )
  );

drop function public.create_medication(text, text, text, date, date, time[], text);

create function public.create_medication(
  p_name text,
  p_dose text,
  p_instructions text,
  p_start_date date,
  p_end_date date,
  p_schedule_times time[],
  p_timezone text,
  p_reminder_sound text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  caller uuid := auth.uid();
  created public.medications;
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  perform public.validate_schedule_values(p_schedule_times, p_timezone);
  insert into public.medications (
    user_id, name, dose, instructions, start_date, end_date, reminder_sound
  ) values (
    caller,
    btrim(p_name),
    btrim(p_dose),
    nullif(btrim(p_instructions), ''),
    coalesce(p_start_date, current_date),
    p_end_date,
    coalesce(p_reminder_sound, 'default')
  ) returning * into created;
  insert into public.medication_schedules (medication_id, time_of_day, timezone)
  select created.id, value, p_timezone from unnest(p_schedule_times) value;
  return jsonb_build_object(
    'medication', to_jsonb(created),
    'schedules', (
      select coalesce(jsonb_agg(to_jsonb(s) order by s.time_of_day), '[]'::jsonb)
      from public.medication_schedules s
      where s.medication_id = created.id
    )
  );
end;
$$;

drop function public.update_medication(uuid, text, text, text, date, date, time[], text);

create function public.update_medication(
  p_medication_id uuid,
  p_name text,
  p_dose text,
  p_instructions text,
  p_start_date date,
  p_end_date date,
  p_schedule_times time[],
  p_timezone text,
  p_reminder_sound text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  caller uuid := auth.uid();
  updated public.medications;
begin
  if caller is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  perform public.validate_schedule_values(p_schedule_times, p_timezone);
  update public.medications set
    name = btrim(p_name),
    dose = btrim(p_dose),
    instructions = nullif(btrim(p_instructions), ''),
    start_date = p_start_date,
    end_date = p_end_date,
    reminder_sound = coalesce(p_reminder_sound, 'default')
  where id = p_medication_id and user_id = caller and active
  returning * into updated;
  if updated.id is null then
    raise exception 'Medication not found' using errcode = 'P0002';
  end if;
  update public.medication_schedules set active = false
  where medication_id = updated.id and active
    and (time_of_day <> all(p_schedule_times) or timezone <> p_timezone);
  insert into public.medication_schedules (medication_id, time_of_day, timezone, active)
  select updated.id, value, p_timezone, true from unnest(p_schedule_times) value
  on conflict (medication_id, time_of_day, timezone) do update set active = true;
  return jsonb_build_object(
    'medication', to_jsonb(updated),
    'schedules', (
      select coalesce(jsonb_agg(to_jsonb(s) order by s.time_of_day), '[]'::jsonb)
      from public.medication_schedules s
      where s.medication_id = updated.id and s.active
    )
  );
end;
$$;

revoke execute on function public.create_medication(text, text, text, date, date, time[], text, text)
from public, anon;
revoke execute on function public.update_medication(uuid, text, text, text, date, date, time[], text, text)
from public, anon;

grant execute on function public.create_medication(text, text, text, date, date, time[], text, text)
to authenticated;
grant execute on function public.update_medication(uuid, text, text, text, date, date, time[], text, text)
to authenticated;
