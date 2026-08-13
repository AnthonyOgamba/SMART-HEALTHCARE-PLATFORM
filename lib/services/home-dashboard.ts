import { supabase } from '@/lib/supabase/client';

export interface HomeMedicationNext { logId: string; medicationId: string; name: string; dose: string; scheduledFor: string }
export interface HomeMedicationSummary { due: number; takenDue: number; futureToday: number; overduePending: number; progressPercentage: number | null; next: HomeMedicationNext | null }
export interface HomeAppointmentSummary { id: string; title: string; providerName: string | null; practitionerType: string | null; startsAt: string; location: string | null }
export interface HomeActivitySummary { completedMinutesToday: number; scheduledMinutesToday: number; dailyGoalMinutes: number | null; progressPercentage: number | null; completedCount: number; scheduledCount: number; recordedStepsToday: number }
export interface HomeSleepSummary { lastSleepId: string; sleepStart: string; wakeTime: string; durationMinutes: number; quality: number | null }
export interface HomeRefillWarning { medicationId: string; name: string; estimatedDaysRemaining: number; refillWarningDays: number }
export interface HomeRefillSummary { warningCount: number; mostUrgent: HomeRefillWarning | null }
export interface HomeDashboard { medications: HomeMedicationSummary; appointment: HomeAppointmentSummary | null; activity: HomeActivitySummary; sleep: HomeSleepSummary | null; refills: HomeRefillSummary; notifications: { unreadCount: number }; today: { totalScheduledItems: number } }

interface RawHomeDashboard {
  medications: { due: number; taken_due: number; future_today: number; overdue_pending: number; progress_percentage: number | null; next: { log_id: string; medication_id: string; name: string; dose: string; scheduled_for: string } | null };
  appointment: { id: string; title: string; provider_name: string | null; practitioner_type: string | null; starts_at: string; location: string | null } | null;
  activity: { completed_minutes_today: number; scheduled_minutes_today: number; daily_goal_minutes: number | null; progress_percentage: number | null; completed_count: number; scheduled_count: number; recorded_steps_today: number };
  sleep: { last_sleep_id: string; sleep_start: string; wake_time: string; duration_minutes: number; quality: number | null } | null;
  refills: { warning_count: number; most_urgent: { medication_id: string; name: string; estimated_days_remaining: number; refill_warning_days: number } | null };
  notifications: { unread_count: number };
  today: { total_scheduled_items: number };
}

const numberValue = (value: unknown) => typeof value === 'number' ? value : Number(value ?? 0);

export function localDayBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return [start.toISOString(), end.toISOString()] as const;
}

export async function getHomeDashboard(date = new Date()): Promise<HomeDashboard> {
  const [start, end] = localDayBounds(date);
  const { data, error } = await supabase.rpc('get_home_dashboard', {
    p_day_start: start,
    p_day_end: end,
    p_now: new Date().toISOString(),
  });
  if (error) throw error;

  const raw = data as unknown as RawHomeDashboard;
  const medicationNext = raw.medications.next;
  const appointment = raw.appointment;
  const sleep = raw.sleep;
  const refill = raw.refills.most_urgent;

  return {
    medications: {
      due: numberValue(raw.medications.due),
      takenDue: numberValue(raw.medications.taken_due),
      futureToday: numberValue(raw.medications.future_today),
      overduePending: numberValue(raw.medications.overdue_pending),
      progressPercentage: raw.medications.progress_percentage === null ? null : numberValue(raw.medications.progress_percentage),
      next: medicationNext ? { logId: medicationNext.log_id, medicationId: medicationNext.medication_id, name: medicationNext.name, dose: medicationNext.dose, scheduledFor: medicationNext.scheduled_for } : null,
    },
    appointment: appointment ? { id: appointment.id, title: appointment.title, providerName: appointment.provider_name, practitionerType: appointment.practitioner_type, startsAt: appointment.starts_at, location: appointment.location } : null,
    activity: {
      completedMinutesToday: numberValue(raw.activity.completed_minutes_today),
      scheduledMinutesToday: numberValue(raw.activity.scheduled_minutes_today),
      dailyGoalMinutes: raw.activity.daily_goal_minutes === null ? null : numberValue(raw.activity.daily_goal_minutes),
      progressPercentage: raw.activity.progress_percentage === null ? null : numberValue(raw.activity.progress_percentage),
      completedCount: numberValue(raw.activity.completed_count),
      scheduledCount: numberValue(raw.activity.scheduled_count),
      recordedStepsToday: numberValue(raw.activity.recorded_steps_today),
    },
    sleep: sleep ? { lastSleepId: sleep.last_sleep_id, sleepStart: sleep.sleep_start, wakeTime: sleep.wake_time, durationMinutes: numberValue(sleep.duration_minutes), quality: sleep.quality === null ? null : numberValue(sleep.quality) } : null,
    refills: { warningCount: numberValue(raw.refills.warning_count), mostUrgent: refill ? { medicationId: refill.medication_id, name: refill.name, estimatedDaysRemaining: numberValue(refill.estimated_days_remaining), refillWarningDays: numberValue(refill.refill_warning_days) } : null },
    notifications: { unreadCount: numberValue(raw.notifications.unread_count) },
    today: { totalScheduledItems: numberValue(raw.today.total_scheduled_items) },
  };
}
