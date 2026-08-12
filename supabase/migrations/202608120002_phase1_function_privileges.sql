-- Backend Phase 1 security hardening: restrict function execution privileges.

revoke execute on function public.handle_new_user()
from public, anon, authenticated;

revoke execute on function public.record_consent(text, boolean)
from public, anon;

grant execute on function public.record_consent(text, boolean)
to authenticated;
