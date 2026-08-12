import { supabase } from '@/lib/supabase/client';
import {
  DEFAULT_MEDICATION_REMINDER_SOUND,
  isMedicationReminderSound,
  type MedicationReminderSound,
} from '@/lib/notification-sounds';
import type {
  Medication,
  MedicationDay,
  MedicationDetails,
  MedicationHistory,
  MedicationLog,
  MedicationSchedule,
} from '@/types';

export interface MedicationInput {
  name: string;
  dose: string;
  instructions?: string | null;
  startDate: string;
  endDate?: string | null;
  scheduleTimes: string[];
  timezone: string;
  reminderSound: MedicationReminderSound;
}

type RawMedication = Record<string, any>;
const medication = (value: RawMedication): Medication => ({
  id: value.id, userId: value.user_id, name: value.name, dose: value.dose,
  instructions: value.instructions, startDate: value.start_date, endDate: value.end_date,
  reminderSound: isMedicationReminderSound(value.reminder_sound)
    ? value.reminder_sound
    : DEFAULT_MEDICATION_REMINDER_SOUND,
  active: value.active, archivedAt: value.archived_at, createdAt: value.created_at, updatedAt: value.updated_at,
});
const schedule = (value: RawMedication): MedicationSchedule => ({
  id: value.id, medicationId: value.medication_id, timeOfDay: value.time_of_day,
  timezone: value.timezone, active: value.active, createdAt: value.created_at, updatedAt: value.updated_at,
});
const log = (value: RawMedication): MedicationLog => ({
  id: value.id, medicationId: value.medication_id, scheduleId: value.schedule_id,
  scheduledFor: value.scheduled_for, status: value.status, recordedAt: value.recorded_at,
  createdAt: value.created_at, updatedAt: value.updated_at,
});

function friendly(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  if (/duplicate/i.test(message)) return new Error('Reminder times must be unique.');
  if (/not found/i.test(message)) return new Error('Medication was not found.');
  if (/date range/i.test(message)) return new Error('Enter a valid date range.');
  return new Error('Medication data could not be saved. Please try again.');
}
async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const callRpc = supabase.rpc as unknown as (
    functionName: string,
    parameters: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: Error | null }>;
  const { data, error } = await callRpc(name, args);
  if (error) throw friendly(error);
  return data as T;
}
const inputArgs = (value: MedicationInput) => ({
  p_name: value.name, p_dose: value.dose, p_instructions: value.instructions ?? null,
  p_start_date: value.startDate, p_end_date: value.endDate ?? null,
  p_schedule_times: value.scheduleTimes, p_timezone: value.timezone,
  p_reminder_sound: value.reminderSound,
});

export async function createMedication(input: MedicationInput) {
  const raw = await rpc<any>('create_medication', inputArgs(input));
  return { medication: medication(raw.medication), schedules: raw.schedules.map(schedule) };
}
export async function updateMedication(id: string, input: MedicationInput) {
  const raw = await rpc<any>('update_medication', { p_medication_id: id, ...inputArgs(input) });
  return { medication: medication(raw.medication), schedules: raw.schedules.map(schedule) };
}
export const archiveMedication = (id: string) => rpc<RawMedication>('archive_medication', { p_medication_id: id });
export async function getMedicationsForDate(date: string): Promise<MedicationDay> {
  await rpc<number>('ensure_medication_logs_for_date', { p_date: date });
  await rpc<number>('refresh_missed_medication_logs', {});
  const raw = await rpc<any>('get_medications_for_date', { p_date: date });
  return { date: raw.date, summary: raw.summary, items: raw.items.map((x: any) => ({ medication: medication(x.medication), schedule: x.schedule ? schedule(x.schedule) : null, log: log(x.log) })) };
}
export async function getMedicationDetails(id: string): Promise<MedicationDetails> {
  await rpc<number>('refresh_missed_medication_logs', {});
  const raw = await rpc<any>('get_medication_details', { p_medication_id: id });
  return { medication: medication(raw.medication), schedules: raw.schedules.map(schedule), nextLog: raw.nextLog ? log(raw.nextLog) : null, adherence: raw.adherence };
}
export const recordMedicationTaken = (id: string) => rpc<MedicationLog>('record_medication_status', { p_log_id: id, p_status: 'taken' });
export const recordMedicationSkipped = (id: string) => rpc<MedicationLog>('record_medication_status', { p_log_id: id, p_status: 'skipped' });
export async function getMedicationHistory(from: string, to: string, medicationId?: string) {
  await rpc<number>('refresh_missed_medication_logs', {});
  return rpc<MedicationHistory>('get_medication_history', {
    p_from: from,
    p_to: to,
    p_medication_id: medicationId ?? null,
  });
}
export async function getActiveMedications() {
  const raw = await rpc<Array<{ medication: RawMedication; schedules: RawMedication[] }>>('get_active_medications', {});
  return raw.map((item) => ({ medication: medication(item.medication), schedules: item.schedules.map(schedule) }));
}
