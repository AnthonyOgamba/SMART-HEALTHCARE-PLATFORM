import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const migration = read('supabase/migrations/202608130001_medication_backend.sql');
const service = read('lib/services/medications.ts');
const reminders = read('lib/services/local-medication-reminders.ts');
const schedule = read('app/(tabs)/appointments.tsx');
const form = read('app/add-medication.tsx');
const details = read('app/medication-details.tsx');
const history = read('app/medication-history.tsx');
const soundMigration = read('supabase/migrations/202608130002_medication_reminder_sounds.sql');
const soundCatalog = read('lib/notification-sounds.ts');
const expoConfig = read('app.config.js');
const securityHardening = read('supabase/migrations/202608130003_security_definer_hardening.sql');

test('creates only the three Phase 2 medication tables', () => {
  assert.deepEqual([...migration.matchAll(/create table public\.([a-z_]+)/g)].map((m) => m[1]), ['medications','medication_schedules','medication_logs']);
});
test('create medication is atomic and derives auth user',()=>{assert.match(migration,/function public\.create_medication/);assert.match(migration,/caller uuid := auth\.uid\(\)/);assert.match(migration,/insert into public\.medication_schedules/);});
test('multiple times supported and duplicate times rejected',()=>{assert.match(migration,/time\[\]/);assert.match(migration,/Duplicate schedule times/);assert.match(form,/setTimes\(\[\.\.\.times,value\]/);});
test('day RPC ensures and lists occurrences with totals',()=>{assert.match(migration,/ensure_medication_logs_for_date/);assert.match(migration,/get_medications_for_date/);for(const x of ['scheduled','taken','skipped','missed','pending'])assert.match(migration,new RegExp(`'${x}'`));});
test('taken and skipped are usable while missed is rejected from client',()=>{assert.match(service,/recordMedicationTaken/);assert.match(service,/recordMedicationSkipped/);assert.match(migration,/p_status not in \('taken', 'skipped'\)/);assert.doesNotMatch(service,/p_status: 'missed'/);});
test('history and adherence formula are implemented',()=>{assert.match(migration,/get_medication_history/);assert.match(migration,/count\(\*\) filter\(where l\.status='taken'\)/);assert.match(history,/Taken ÷ finalized doses/);});
test('edit replaces future schedules without rewriting logs',()=>{const body=migration.split('function public.update_medication')[1].split('function public.archive_medication')[0];assert.match(body,/update public\.medication_schedules set active = false/);assert.doesNotMatch(body,/update public\.medication_logs/);assert.match(form,/editing\?'Edit Medication'/);});
test('archive is idempotent and preserves history',()=>{assert.match(migration,/archived_at = coalesce\(archived_at, now\(\)\)/);assert.doesNotMatch(migration,/delete from public\.medication_logs/);assert.match(details,/cancelMedicationReminders/);});
test('RLS protects medications, schedules, logs through auth ownership',()=>{for(const t of ['medications','medication_schedules','medication_logs'])assert.match(migration,new RegExp(`alter table public\\.${t} enable row level security`));assert.match(migration,/m\.user_id = \(select auth\.uid\(\)\)/);});
test('unauthenticated roles have no direct table or RPC access',()=>{assert.match(migration,/revoke all on public\.medications, public\.medication_schedules, public\.medication_logs from anon, authenticated/);assert.match(migration,/revoke execute[\s\S]*from public, anon/);});
test('missed doses use deterministic two-hour on-demand refresh',()=>{assert.match(migration,/interval '2 hours'/);assert.match(migration,/refresh_missed_medication_logs/);assert.match(migration,/perform public\.refresh_missed_medication_logs\(\)/);});
test('local reminders request permission, schedule, persist and cancel',()=>{assert.match(reminders,/requestPermissionsAsync/);assert.match(reminders,/scheduleNotificationAsync/);assert.match(reminders,/AsyncStorage/);assert.match(reminders,/cancelScheduledNotificationAsync/);});
test('permission denial does not prevent database save',()=>{assert.ok(form.indexOf("const result=id?await updateMedication") < form.lastIndexOf('scheduleMedicationReminders'));assert.match(form,/Medication Saved/);});
test('empty medication states are present',()=>{assert.match(schedule,/No health activities scheduled for this day/);assert.match(history,/No medication history for this period/);});
test('all public capabilities have frontend paths',()=>{
 const audit=[['create_medication',form],['update_medication',form],['archive_medication',details],['get_medications_for_date',schedule],['get_medication_details',details],['record_medication_status',service],['get_medication_history',history]];
 for(const [rpc,screen] of audit){assert.match(migration,new RegExp(rpc));assert.ok(screen.length>0);}
});
test('User A cannot select User B medication',()=>{assert.match(migration,/medications_select_own[\s\S]*auth\.uid\(\)/);});
test('User A cannot access User B schedule by ID',()=>{assert.match(migration,/medication_schedules_select_own[\s\S]*exists[\s\S]*m\.user_id/);});
test('User A cannot access User B log by ID',()=>{assert.match(migration,/medication_logs_select_own[\s\S]*exists[\s\S]*m\.user_id/);});
test('archived medication history stays queryable under owner protection',()=>{assert.doesNotMatch(migration,/delete from public\.medications/);assert.match(migration,/get_medication_history[\s\S]*m\.user_id=caller/);});
test('local reminder reconciliation is wired at startup and global setting',()=>{assert.match(read('providers/medication-reminder-provider.tsx'),/reconcileMedicationReminders/);assert.match(read('app/settings.tsx'),/reconcileMedicationReminders/);});
test('logical medication sounds are persisted without storing device identifiers',()=>{for(const key of ['default','gentle_chime','soft_bell','bright_alert','calm_tone','classic_reminder'])assert.match(soundMigration,new RegExp(`'${key}'`));assert.doesNotMatch(soundMigration,/notification_id|device_id/);assert.match(service,/p_reminder_sound/);});
test('sound catalog maps every custom choice to a stable bundled filename',()=>{for(const filename of ['medication_gentle_chime.wav','medication_soft_bell.wav','medication_bright_alert.wav','medication_calm_tone.wav','medication_classic_reminder.wav']){assert.match(soundCatalog,new RegExp(filename));assert.match(expoConfig,new RegExp(filename));}});
test('missing custom sounds fall back and Android channels are stable',()=>{assert.match(reminders,/filename \?\? 'default'/);assert.match(reminders,/getNotificationChannelAsync/);assert.match(reminders,/if \(!existing\)/);assert.match(reminders,/medication-reminders-v\$\{CHANNEL_VERSION\}/);});
test('medication form selects and restores the logical reminder sound',()=>{assert.match(form,/MEDICATION_REMINDER_SOUNDS\.map/);assert.match(form,/setReminderSound\(value\.medication\.reminderSound\)/);assert.match(form,/reminderSound/);});
test('read RPCs are SECURITY INVOKER and rely on owner RLS',()=>{for(const fn of ['get_active_medications','get_medication_details','get_medication_history','get_medications_for_date']){const body=securityHardening.split(`function public.${fn}`)[1].split('$$;')[0];assert.match(body,/security invoker/);assert.doesNotMatch(body,/security definer/);}for(const table of ['medications','medication_schedules','medication_logs'])assert.match(migration,new RegExp(`${table}_select_own[\\s\\S]*auth\\.uid\\(\\)`));});
test('User A supplied User B UUID is filtered by RLS in read RPCs',()=>{const detailsBody=securityHardening.split('function public.get_medication_details')[1].split('$$;')[0];const historyBody=securityHardening.split('function public.get_medication_history')[1].split('$$;')[0];assert.doesNotMatch(detailsBody,/security definer/);assert.doesNotMatch(historyBody,/security definer/);assert.match(detailsBody,/from public\.medications/);assert.match(historyBody,/from public\.medications/);});
test('controlled write RPCs retain hardened SECURITY DEFINER boundaries',()=>{for(const fn of ['create_medication','update_medication']){const body=soundMigration.split(`create function public.${fn}`)[1].split('$$;')[0];assert.match(body,/security definer set search_path = ''/);assert.match(body,/auth\.uid\(\)/);}for(const fn of ['archive_medication','ensure_medication_logs_for_date','refresh_missed_medication_logs','record_medication_status']){const body=migration.split(`function public.${fn}`)[1].split('$$;')[0];assert.match(body,/security definer set search_path = ''/);assert.match(body,/auth\.uid\(\)/);assert.match(body,/Authentication required/);assert.doesNotMatch(body,/execute\s+format|execute\s+\w/i);}});
test('User A cannot update archive or alter User B resources',()=>{const update=soundMigration.split('create function public.update_medication')[1].split('$$;')[0];const archive=migration.split('function public.archive_medication')[1].split('$$;')[0];const status=migration.split('function public.record_medication_status')[1].split('$$;')[0];assert.match(update,/user_id = caller/);assert.match(archive,/user_id = caller/);assert.match(status,/m\.user_id=caller/);assert.doesNotMatch(update,/p_user_id/);});
test('anonymous execution is revoked for every protected application RPC',()=>{for(const fn of ['record_consent','create_medication','update_medication','archive_medication','ensure_medication_logs_for_date','refresh_missed_medication_logs','record_medication_status','get_medications_for_date','get_medication_details','get_medication_history','get_active_medications'])assert.match(securityHardening,new RegExp(`revoke execute on function public\\.${fn}\\([\\s\\S]*?from public, anon`));});
test('mobile service performs controlled log writes before invoker reads',()=>{assert.ok(service.indexOf("rpc<number>('ensure_medication_logs_for_date'")<service.indexOf("rpc<any>('get_medications_for_date'"));assert.ok(service.indexOf("rpc<number>('refresh_missed_medication_logs'")<service.indexOf("rpc<any>('get_medication_details'"));assert.match(service,/getMedicationHistory[\s\S]*refresh_missed_medication_logs[\s\S]*get_medication_history/);});
