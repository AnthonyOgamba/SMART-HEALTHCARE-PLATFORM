-- Remove obsolete future dose cards left by schedule edits made before
-- 202608160001_medication_schedule_corrections.sql was applied.
-- Finalized and past medication history remains unchanged.

delete from public.medication_logs l
using public.medication_schedules s
where l.schedule_id = s.id
  and not s.active
  and l.status = 'pending'
  and l.scheduled_for >= now();
