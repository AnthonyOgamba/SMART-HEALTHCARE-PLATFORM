import { admin } from '../db.js';

const isoDays = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
const checked = <T>(result: { data: T | null; error: unknown }, source: string): T => {
  if (result.error) throw Object.assign(new Error(`AI context source unavailable: ${source}`), { status: 503, code: 'AI_CONTEXT_UNAVAILABLE', stage: 'context' });
  return result.data as T;
};
const dayBounds = (timezoneOffsetMinutes = 0) => {
  const localNow = new Date(Date.now() - timezoneOffsetMinutes * 60_000);
  const localStartUtc = Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate());
  const start = new Date(localStartUtc + timezoneOffsetMinutes * 60_000);
  return [start.toISOString(), new Date(start.getTime() + 86400000).toISOString()] as const;
};

export async function getContext(userId: string, intent: string, timezoneOffsetMinutes = 0): Promise<Record<string, any>> {
  if (intent === 'day') {
    const [from, to] = dayBounds(timezoneOffsetMinutes);
    const [medicationLogs, appointments, activities] = await Promise.all([
      admin.from('medication_logs').select('scheduled_for,status,medications!inner(name,dose,user_id)').eq('medications.user_id',userId).gte('scheduled_for',from).lt('scheduled_for',to).order('scheduled_for'),
      admin.from('appointments').select('id,title,provider_name,starts_at,status').eq('user_id',userId).gte('starts_at',from).lt('starts_at',to).order('starts_at'),
      admin.from('activity_logs').select('id,activity_type,started_at,duration_minutes,status').eq('user_id',userId).gte('started_at',from).lt('started_at',to).order('started_at'),
    ]);
    return { date_range: { from, to }, medications: checked(medicationLogs,'medications')??[], appointments: checked(appointments,'appointments')??[], activities: checked(activities,'activities')??[] };
  }
  if (intent === 'appointments' || intent === 'appointment-prep') {
    const result = await admin.from('appointments').select('id,title,provider_name,starts_at,status,notes').eq('user_id', userId).gte('starts_at', new Date().toISOString()).order('starts_at').limit(10);
    return { appointments: checked(result,'appointments') ?? [] };
  }
  if (intent === 'medications') {
    const [medications, logs] = await Promise.all([
      admin.from('medications').select('name,dose,active').eq('user_id', userId).eq('active', true),
      admin.from('medication_logs').select('scheduled_for,status,medications!inner(name,user_id)').eq('medications.user_id', userId).gte('scheduled_for', isoDays(7)),
    ]);
    return { medications: checked(medications,'medications') ?? [], logs: checked(logs,'medication_logs') ?? [] };
  }
  if (intent === 'activity') return { activities: (await admin.from('activity_logs').select('activity_type,started_at,duration_minutes,steps,status').eq('user_id', userId).gte('started_at', isoDays(7))).data ?? [] };
  if (intent === 'sleep') return { sleep: (await admin.from('sleep_logs').select('sleep_start,wake_time,quality').eq('user_id', userId).gte('wake_time', isoDays(14))).data ?? [] };
  if (intent === 'symptoms') return { symptoms: (await admin.from('symptom_assessments').select('symptoms,urgency,summary,created_at').eq('user_id', userId).gte('created_at', isoDays(30))).data ?? [] };
  return {};
}

export function inferIntent(text: string) {
  if (/schedule|scheduled|today|my day|care plan/i.test(text)) return 'day';
  if (/appointment|doctor|physio|dentist/i.test(text)) return 'appointments';
  if (/medication|dose|adherence|skipped/i.test(text)) return 'medications';
  if (/activity|walk|exercise|steps/i.test(text)) return 'activity';
  if (/sleep/i.test(text)) return 'sleep';
  if (/symptom|headache|nausea|pattern/i.test(text)) return 'symptoms';
  return 'general';
}
