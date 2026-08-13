-- Phase 4: owner-isolated records produced by the protected local AI gateway.

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_title_check check (title is null or char_length(btrim(title)) between 1 and 160)
);

create table public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null check (char_length(btrim(content)) between 1 and 12000),
  created_at timestamptz not null default now()
);

create table public.symptom_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symptoms jsonb not null check (jsonb_typeof(symptoms) = 'object'),
  urgency text not null check (urgency in ('emergency','urgent','routine','self_care')),
  summary text not null check (char_length(btrim(summary)) between 1 and 4000),
  possible_considerations jsonb not null default '[]'::jsonb check (jsonb_typeof(possible_considerations) = 'array'),
  red_flags jsonb not null default '[]'::jsonb check (jsonb_typeof(red_flags) = 'array'),
  next_step text not null check (char_length(btrim(next_step)) between 1 and 2000),
  disclaimer text not null check (char_length(btrim(disclaimer)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index conversations_user_updated_idx on public.conversations(user_id, updated_at desc);
create index conversation_messages_conversation_created_idx on public.conversation_messages(conversation_id, created_at);
create index symptom_assessments_user_created_idx on public.symptom_assessments(user_id, created_at desc);
create trigger conversations_set_updated_at before update on public.conversations for each row execute function public.set_updated_at();

alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.symptom_assessments enable row level security;

create policy conversations_select_own on public.conversations for select to authenticated using (user_id = (select auth.uid()));
create policy conversation_messages_select_own on public.conversation_messages for select to authenticated using (
  exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = (select auth.uid()))
);
create policy symptom_assessments_select_own on public.symptom_assessments for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.conversations, public.conversation_messages, public.symptom_assessments from public, anon, authenticated;
grant select on public.conversations, public.conversation_messages, public.symptom_assessments to authenticated;

comment on table public.conversations is 'AI conversation metadata; writes are restricted to the protected AI gateway.';
comment on table public.conversation_messages is 'AI messages written by the protected gateway so trusted roles cannot be spoofed by mobile clients.';
comment on table public.symptom_assessments is 'Structured AI-assisted guidance, never a verified diagnosis.';
