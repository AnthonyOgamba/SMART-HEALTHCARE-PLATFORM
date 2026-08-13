-- Activity completion, recurrence, editing, and adherence.

alter table public.activity_logs
  add column status text not null default 'completed'
    constraint activity_logs_status_check check (status in ('scheduled','completed','skipped')),
  add column completed_at timestamptz,
  add column series_id uuid,
  add column recurrence text not null default 'none'
    constraint activity_logs_recurrence_check check (recurrence in ('none','daily','weekly'));

update public.activity_logs set completed_at = coalesce(updated_at, created_at) where status = 'completed';
alter table public.activity_logs alter column status set default 'scheduled';
create index activity_logs_user_series_idx on public.activity_logs(user_id,series_id) where series_id is not null;

create function public.save_activity(
  p_id uuid,p_activity_type text,p_started_at timestamptz,p_duration_minutes integer,
  p_distance_km numeric,p_steps integer,p_notes text,p_recurrence text,p_recurrence_until date
) returns public.activity_logs language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); r public.activity_logs; first_activity public.activity_logs; inserted_activity public.activity_logs; occurrence timestamptz; series uuid;
begin
  if u is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_started_at is null or p_activity_type not in ('Walking','Running','Cycling','Gym / Strength','Stretching','Swimming','Other')
    or coalesce(p_recurrence,'none') not in ('none','daily','weekly')
    or (p_duration_minutes is not null and p_duration_minutes<0)
    or (p_distance_km is not null and p_distance_km<0) or (p_steps is not null and p_steps<0)
    or char_length(coalesce(p_notes,''))>2000 then raise exception 'Invalid activity' using errcode='22023'; end if;
  if p_id is not null then
    update public.activity_logs set activity_type=p_activity_type,started_at=p_started_at,duration_minutes=p_duration_minutes,
      distance_km=p_distance_km,steps=p_steps,notes=nullif(btrim(p_notes),'')
      where id=p_id and user_id=u returning * into r;
    if r.id is null then raise exception 'Activity not found' using errcode='P0002'; end if;
    return r;
  end if;
  if coalesce(p_recurrence,'none')<>'none' and (p_recurrence_until is null or p_recurrence_until<p_started_at::date or p_recurrence_until>p_started_at::date+366)
    then raise exception 'Recurring activities require an end date within one year' using errcode='22023'; end if;
  series:=case when coalesce(p_recurrence,'none')='none' then null else gen_random_uuid() end;
  occurrence:=p_started_at;
  loop
    insert into public.activity_logs(user_id,activity_type,started_at,duration_minutes,distance_km,steps,notes,status,series_id,recurrence)
      values(u,p_activity_type,occurrence,p_duration_minutes,p_distance_km,p_steps,nullif(btrim(p_notes),''),'scheduled',series,coalesce(p_recurrence,'none')) returning * into inserted_activity;
    if first_activity.id is null then first_activity:=inserted_activity; end if;
    exit when coalesce(p_recurrence,'none')='none' or occurrence::date>=p_recurrence_until;
    occurrence:=occurrence+case p_recurrence when 'daily' then interval '1 day' else interval '7 days' end;
    exit when occurrence::date>p_recurrence_until;
  end loop;
  return first_activity;
end $$;

create function public.set_activity_status(p_id uuid,p_status text) returns public.activity_logs
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); r public.activity_logs;
begin
  if u is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_status not in ('completed','skipped') then raise exception 'Invalid activity status' using errcode='22023'; end if;
  select * into r from public.activity_logs where id=p_id and user_id=u for update;
  if r.id is null then raise exception 'Activity not found' using errcode='P0002'; end if;
  if r.status=p_status then return r; end if;
  if r.status<>'scheduled' then raise exception 'Activity status is already final' using errcode='23514'; end if;
  update public.activity_logs set status=p_status,completed_at=case when p_status='completed' then now() else null end
    where id=r.id returning * into r;
  return r;
end $$;

create function public.get_activity_details(p_id uuid) returns public.activity_logs
language sql security invoker set search_path='' as $$ select * from public.activity_logs where id=p_id $$;

create function public.get_activity_adherence(p_from timestamptz,p_to timestamptz) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
  if p_from is null or p_to is null or p_from>=p_to then raise exception 'Invalid adherence range' using errcode='22023'; end if;
  select jsonb_build_object(
    'due',count(*) filter(where started_at<=least(p_to,now())),
    'completed',count(*) filter(where started_at<=least(p_to,now()) and status='completed'),
    'percentage',case when count(*) filter(where started_at<=least(p_to,now()))=0 then null else round(100.0*count(*) filter(where started_at<=least(p_to,now()) and status='completed')/count(*) filter(where started_at<=least(p_to,now()))) end
  ) into result from public.activity_logs where started_at>=p_from and started_at<p_to;
  return result;
end
$$;

revoke execute on function public.save_activity(uuid,text,timestamptz,integer,numeric,integer,text,text,date) from public,anon;
revoke execute on function public.set_activity_status(uuid,text) from public,anon;
revoke execute on function public.get_activity_details(uuid) from public,anon;
revoke execute on function public.get_activity_adherence(timestamptz,timestamptz) from public,anon;
revoke execute on function public.create_activity(text,timestamptz,integer,numeric,integer,text) from authenticated;
grant execute on function public.save_activity(uuid,text,timestamptz,integer,numeric,integer,text,text,date) to authenticated;
grant execute on function public.set_activity_status(uuid,text) to authenticated;
grant execute on function public.get_activity_details(uuid) to authenticated;
grant execute on function public.get_activity_adherence(timestamptz,timestamptz) to authenticated;
