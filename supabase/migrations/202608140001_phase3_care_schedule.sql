-- Phase 3: appointments, in-app notifications, manual wellness logs, and medication supply.

alter table public.user_settings add column daily_activity_goal_minutes integer
  constraint user_settings_activity_goal_check check (daily_activity_goal_minutes is null or daily_activity_goal_minutes > 0);
grant update (daily_activity_goal_minutes) on public.user_settings to authenticated;

alter table public.medications
  add column supply_quantity numeric constraint medications_supply_quantity_check check (supply_quantity is null or supply_quantity >= 0),
  add column units_per_dose numeric constraint medications_units_per_dose_check check (units_per_dose is null or units_per_dose > 0),
  add column supply_unit text constraint medications_supply_unit_check check (supply_unit is null or supply_unit in ('tablet','capsule','mL','dose','other')),
  add column refill_warning_days integer constraint medications_refill_warning_check check (refill_warning_days is null or refill_warning_days >= 0),
  add column last_refilled_at timestamptz;

create table public.appointments (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 160), provider_name text check (provider_name is null or char_length(provider_name)<=160),
  practitioner_type text check (practitioner_type is null or char_length(practitioner_type)<=120), appointment_type text check (appointment_type is null or char_length(appointment_type)<=160),
  location text check (location is null or char_length(location)<=500), starts_at timestamptz not null, ends_at timestamptz,
  notes text check (notes is null or char_length(notes)<=4000), status text not null default 'scheduled' check(status in ('scheduled','completed','cancelled')),
  reminder_at timestamptz, reminder_sound text not null default 'default' check(reminder_sound in ('default','gentle_chime','soft_bell','bright_alert','calm_tone','classic_reminder')),
  attendance_confirmed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check(ends_at is null or ends_at>starts_at), check(reminder_at is null or reminder_at<starts_at)
);
create index appointments_user_starts_idx on public.appointments(user_id,starts_at);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check(activity_type in ('Walking','Running','Cycling','Gym / Strength','Stretching','Swimming','Other')),
  started_at timestamptz not null, duration_minutes integer check(duration_minutes is null or duration_minutes>=0),
  distance_km numeric check(distance_km is null or distance_km>=0), steps integer check(steps is null or steps>=0),
  notes text check(notes is null or char_length(notes)<=2000), source text not null default 'manual' check(source in ('manual','apple_health','health_connect')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index activity_logs_user_started_idx on public.activity_logs(user_id,started_at);

create table public.sleep_logs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  sleep_start timestamptz not null, wake_time timestamptz not null, quality integer check(quality is null or quality between 1 and 5),
  notes text check(notes is null or char_length(notes)<=2000), source text not null default 'manual' check(source in ('manual','apple_health','health_connect')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(wake_time>sleep_start)
);
create index sleep_logs_user_wake_idx on public.sleep_logs(user_id,wake_time);

create table public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check(type in ('medication','appointment','refill','activity','general','critical')),
  title text not null check(char_length(btrim(title)) between 1 and 160), body text not null check(char_length(btrim(body)) between 1 and 1000),
  appointment_id uuid references public.appointments(id) on delete cascade, medication_log_id uuid references public.medication_logs(id) on delete cascade,
  read_at timestamptz, created_at timestamptz not null default now(), check(num_nonnulls(appointment_id,medication_log_id)<=1)
);
create index notifications_user_created_idx on public.notifications(user_id,created_at desc);

create table public.medication_refills (
  id uuid primary key default gen_random_uuid(), medication_id uuid not null references public.medications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, quantity_received numeric not null check(quantity_received>0),
  refilled_at timestamptz not null, created_at timestamptz not null default now()
);
create index medication_refills_user_date_idx on public.medication_refills(user_id,refilled_at desc);

create trigger appointments_set_updated_at before update on public.appointments for each row execute function public.set_updated_at();
create trigger activity_logs_set_updated_at before update on public.activity_logs for each row execute function public.set_updated_at();
create trigger sleep_logs_set_updated_at before update on public.sleep_logs for each row execute function public.set_updated_at();

alter table public.appointments enable row level security; alter table public.activity_logs enable row level security;
alter table public.sleep_logs enable row level security; alter table public.notifications enable row level security; alter table public.medication_refills enable row level security;
create policy appointments_own on public.appointments for select to authenticated using(user_id=(select auth.uid()));
create policy activities_own on public.activity_logs for select to authenticated using(user_id=(select auth.uid()));
create policy sleep_own on public.sleep_logs for select to authenticated using(user_id=(select auth.uid()));
create policy notifications_own on public.notifications for select to authenticated using(user_id=(select auth.uid()));
create policy refills_own on public.medication_refills for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.appointments,public.activity_logs,public.sleep_logs,public.notifications,public.medication_refills from public,anon,authenticated;
grant select on public.appointments,public.activity_logs,public.sleep_logs,public.notifications,public.medication_refills to authenticated;

create function public.create_system_notification_internal(p_user_id uuid,p_type text,p_title text,p_body text,p_appointment_id uuid default null,p_medication_log_id uuid default null)
returns public.notifications language plpgsql security definer set search_path='' as $$ declare n public.notifications; begin
 if p_user_id is null or p_type not in ('medication','appointment','refill','activity','general','critical') then raise exception 'Invalid system notification' using errcode='22023'; end if;
 if num_nonnulls(p_appointment_id,p_medication_log_id)>1 then raise exception 'Only one related resource is allowed' using errcode='22023'; end if;
 if p_appointment_id is not null and not exists(select 1 from public.appointments a where a.id=p_appointment_id and a.user_id=p_user_id) then raise exception 'Appointment ownership mismatch' using errcode='42501'; end if;
 if p_medication_log_id is not null and not exists(select 1 from public.medication_logs l join public.medications m on m.id=l.medication_id where l.id=p_medication_log_id and m.user_id=p_user_id) then raise exception 'Medication log ownership mismatch' using errcode='42501'; end if;
 if p_type='critical' then raise exception 'Critical notifications require future trusted logic' using errcode='42501'; end if;
 insert into public.notifications(user_id,type,title,body,appointment_id,medication_log_id) values(p_user_id,p_type,btrim(p_title),btrim(p_body),p_appointment_id,p_medication_log_id) returning * into n;
 return n;
end $$;

create function public.save_appointment(p_id uuid,p_title text,p_provider_name text,p_practitioner_type text,p_appointment_type text,p_location text,p_starts_at timestamptz,p_ends_at timestamptz,p_notes text,p_reminder_at timestamptz,p_reminder_sound text)
returns public.appointments language plpgsql security definer set search_path='' as $$ declare u uuid:=auth.uid(); a public.appointments; created boolean:=p_id is null; begin
 if u is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_starts_at is null or (p_ends_at is not null and p_ends_at<=p_starts_at) or (p_reminder_at is not null and p_reminder_at>=p_starts_at) then raise exception 'Invalid appointment time' using errcode='22023'; end if;
 if p_id is null then insert into public.appointments(user_id,title,provider_name,practitioner_type,appointment_type,location,starts_at,ends_at,notes,reminder_at,reminder_sound) values(u,btrim(p_title),nullif(btrim(p_provider_name),''),nullif(btrim(p_practitioner_type),''),nullif(btrim(p_appointment_type),''),nullif(btrim(p_location),''),p_starts_at,p_ends_at,nullif(btrim(p_notes),''),p_reminder_at,coalesce(p_reminder_sound,'default')) returning * into a;
 else update public.appointments set title=btrim(p_title),provider_name=nullif(btrim(p_provider_name),''),practitioner_type=nullif(btrim(p_practitioner_type),''),appointment_type=nullif(btrim(p_appointment_type),''),location=nullif(btrim(p_location),''),starts_at=p_starts_at,ends_at=p_ends_at,notes=nullif(btrim(p_notes),''),reminder_at=p_reminder_at,reminder_sound=coalesce(p_reminder_sound,'default') where id=p_id and user_id=u and status='scheduled' returning * into a; end if;
 if a.id is null then raise exception 'Appointment not found' using errcode='P0002'; end if;
 if created then perform public.create_system_notification_internal(u,'appointment','Appointment added','Your personal appointment was added to Care Schedule.',a.id,null); end if;
 return a; end $$;
create function public.set_appointment_status(p_id uuid,p_status text) returns public.appointments language plpgsql security definer set search_path='' as $$ declare u uuid:=auth.uid(); a public.appointments; begin if u is null then raise exception 'Authentication required' using errcode='42501'; end if; if p_status not in ('cancelled','completed') then raise exception 'Invalid status' using errcode='22023'; end if; update public.appointments set status=p_status where id=p_id and user_id=u and status='scheduled' returning * into a; if a.id is null then raise exception 'Appointment not found' using errcode='P0002'; end if; if p_status='cancelled' then perform public.create_system_notification_internal(u,'appointment','Appointment cancelled','Your personal appointment was cancelled in Care Schedule.',a.id,null); end if; return a; end $$;
create function public.confirm_appointment_attendance(p_id uuid) returns public.appointments language plpgsql security definer set search_path='' as $$ declare u uuid:=auth.uid(); a public.appointments; begin if u is null then raise exception 'Authentication required' using errcode='42501'; end if; update public.appointments set attendance_confirmed_at=coalesce(attendance_confirmed_at,now()) where id=p_id and user_id=u and status='scheduled' returning * into a; if a.id is null then raise exception 'Appointment not found' using errcode='P0002'; end if; return a; end $$;
create function public.get_appointments(p_from timestamptz,p_to timestamptz) returns setof public.appointments language sql security invoker set search_path='' as $$ select * from public.appointments where starts_at>=p_from and starts_at<p_to order by starts_at $$;
create function public.get_appointment_details(p_id uuid) returns public.appointments language sql security invoker set search_path='' as $$ select * from public.appointments where id=p_id $$;

create function public.create_activity(p_activity_type text,p_started_at timestamptz,p_duration_minutes integer,p_distance_km numeric,p_steps integer,p_notes text) returns public.activity_logs language plpgsql security definer set search_path='' as $$ declare u uuid:=auth.uid(); r public.activity_logs; begin if u is null then raise exception 'Authentication required' using errcode='42501'; end if; insert into public.activity_logs(user_id,activity_type,started_at,duration_minutes,distance_km,steps,notes) values(u,p_activity_type,p_started_at,p_duration_minutes,p_distance_km,p_steps,nullif(btrim(p_notes),'')) returning * into r; return r; end $$;
create function public.create_sleep_log(p_sleep_start timestamptz,p_wake_time timestamptz,p_quality integer,p_notes text) returns public.sleep_logs language plpgsql security definer set search_path='' as $$ declare u uuid:=auth.uid(); r public.sleep_logs; begin if u is null then raise exception 'Authentication required' using errcode='42501'; end if; insert into public.sleep_logs(user_id,sleep_start,wake_time,quality,notes) values(u,p_sleep_start,p_wake_time,p_quality,nullif(btrim(p_notes),'')) returning * into r; return r; end $$;
create function public.mark_notification_read(p_id uuid) returns public.notifications language plpgsql security definer set search_path='' as $$ declare u uuid:=auth.uid(); r public.notifications; begin if u is null then raise exception 'Authentication required' using errcode='42501'; end if; update public.notifications set read_at=coalesce(read_at,now()) where id=p_id and user_id=u returning * into r; if r.id is null then raise exception 'Notification not found' using errcode='P0002'; end if; return r; end $$;
create function public.mark_all_notifications_read() returns integer language plpgsql security definer set search_path='' as $$ declare u uuid:=auth.uid(); n integer; begin if u is null then raise exception 'Authentication required' using errcode='42501'; end if; update public.notifications set read_at=coalesce(read_at,now()) where user_id=u and read_at is null; get diagnostics n=row_count; return n; end $$;
create function public.mark_medication_refilled(p_medication_id uuid,p_quantity numeric,p_refilled_at timestamptz) returns public.medications language plpgsql security definer set search_path='' as $$ declare u uuid:=auth.uid(); m public.medications; begin if u is null then raise exception 'Authentication required' using errcode='42501'; end if; if p_quantity is null or p_quantity<=0 or p_refilled_at is null then raise exception 'Invalid refill' using errcode='22023'; end if;
 update public.medications set supply_quantity=p_quantity,last_refilled_at=p_refilled_at
 where id = p_medication_id
   and user_id = u
 returning * into m;
 if m.id is null then raise exception 'Medication not found' using errcode='P0002'; end if; insert into public.medication_refills(medication_id,user_id,quantity_received,refilled_at) values(m.id,u,p_quantity,p_refilled_at); return m; end $$;
create function public.configure_medication_supply(p_medication_id uuid,p_supply_quantity numeric,p_units_per_dose numeric,p_supply_unit text,p_refill_warning_days integer) returns public.medications language plpgsql security definer set search_path='' as $$ declare u uuid:=auth.uid(); m public.medications; begin if u is null then raise exception 'Authentication required' using errcode='42501'; end if; update public.medications set supply_quantity=p_supply_quantity,units_per_dose=p_units_per_dose,supply_unit=p_supply_unit,refill_warning_days=p_refill_warning_days where id=p_medication_id and user_id=u returning * into m; if m.id is null then raise exception 'Medication not found' using errcode='P0002'; end if; return m; end $$;

create or replace function public.record_medication_status(p_log_id uuid,p_status text) returns public.medication_logs language plpgsql security definer set search_path='' as $$ declare u uuid:=auth.uid(); l public.medication_logs; changed public.medication_logs; med public.medications; schedule_count integer; old_days numeric; new_days numeric; begin if u is null then raise exception 'Authentication required' using errcode='42501'; end if; if p_status not in ('taken','skipped') then raise exception 'Only taken or skipped may be recorded' using errcode='22023'; end if; select x.* into l from public.medication_logs x join public.medications m on m.id=x.medication_id where x.id=p_log_id and m.user_id=u for update of x; if l.id is null then raise exception 'Medication log not found' using errcode='P0002'; end if; if l.status=p_status then return l; end if; if l.status<>'pending' then raise exception 'Medication log is already finalized' using errcode='23505'; end if; update public.medication_logs set status=p_status,recorded_at=now() where id=l.id returning * into changed; if p_status='taken' then
 select * into med from public.medications where id=l.medication_id and user_id=u for update;
 select count(*) into schedule_count from public.medication_schedules where medication_id=med.id and active;
 if med.supply_quantity is not null and med.units_per_dose is not null then
  if schedule_count>0 then old_days:=med.supply_quantity/(med.units_per_dose*schedule_count); end if;
  update public.medications set supply_quantity=greatest(0,supply_quantity-units_per_dose) where id=med.id returning * into med;
  if schedule_count>0 then new_days:=med.supply_quantity/(med.units_per_dose*schedule_count); end if;
  if med.refill_warning_days is not null and old_days>med.refill_warning_days and new_days<=med.refill_warning_days then perform public.create_system_notification_internal(u,'refill','Refill warning','Estimated medication supply has reached your refill warning threshold.',null,l.id); end if;
 end if;
 end if; return changed; end $$;

revoke execute on function public.save_appointment(uuid,text,text,text,text,text,timestamptz,timestamptz,text,timestamptz,text) from public,anon;
revoke execute on function public.set_appointment_status(uuid,text) from public,anon;
revoke execute on function public.confirm_appointment_attendance(uuid) from public,anon;
revoke execute on function public.get_appointments(timestamptz,timestamptz) from public,anon;
revoke execute on function public.get_appointment_details(uuid) from public,anon;
revoke execute on function public.create_activity(text,timestamptz,integer,numeric,integer,text) from public,anon;
revoke execute on function public.create_sleep_log(timestamptz,timestamptz,integer,text) from public,anon;
revoke execute on function public.mark_notification_read(uuid) from public,anon;
revoke execute on function public.mark_all_notifications_read() from public,anon;
revoke execute on function public.mark_medication_refilled(uuid,numeric,timestamptz) from public,anon;
revoke execute on function public.configure_medication_supply(uuid,numeric,numeric,text,integer) from public,anon;
revoke execute on function public.create_system_notification_internal(uuid,text,text,text,uuid,uuid) from public,anon,authenticated;
grant execute on function public.save_appointment(uuid,text,text,text,text,text,timestamptz,timestamptz,text,timestamptz,text) to authenticated;
grant execute on function public.set_appointment_status(uuid,text) to authenticated;
grant execute on function public.confirm_appointment_attendance(uuid) to authenticated;
grant execute on function public.get_appointments(timestamptz,timestamptz) to authenticated;
grant execute on function public.get_appointment_details(uuid) to authenticated;
grant execute on function public.create_activity(text,timestamptz,integer,numeric,integer,text) to authenticated;
grant execute on function public.create_sleep_log(timestamptz,timestamptz,integer,text) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;
grant execute on function public.mark_medication_refilled(uuid,numeric,timestamptz) to authenticated;
grant execute on function public.configure_medication_supply(uuid,numeric,numeric,text,integer) to authenticated;
