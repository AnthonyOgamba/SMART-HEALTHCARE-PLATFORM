alter table public.user_settings
add column appearance text not null default 'light'
constraint user_settings_appearance_check check (appearance in ('light','dark')),
add column onboarding_completed_at timestamptz;

-- Existing accounts have already used the app; only accounts created after this
-- migration should enter the first-login onboarding flow.
update public.user_settings set onboarding_completed_at = now()
where onboarding_completed_at is null;

grant update (appearance,onboarding_completed_at) on public.user_settings to authenticated;
