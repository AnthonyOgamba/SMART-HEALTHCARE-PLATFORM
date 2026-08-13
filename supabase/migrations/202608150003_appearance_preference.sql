alter table public.user_settings
add column appearance text not null default 'light'
constraint user_settings_appearance_check check (appearance in ('light','dark'));

grant update (appearance) on public.user_settings to authenticated;
