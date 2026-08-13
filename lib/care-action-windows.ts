export const APPOINTMENT_CHECK_IN_BEFORE_MS = 30 * 60 * 1000;
export const APPOINTMENT_CHECK_IN_AFTER_MS = 4 * 60 * 60 * 1000;
export const MEDICATION_EARLY_ACTION_MS = 15 * 60 * 1000;

export function canConfirmMedication(scheduledFor: string, now = new Date()) {
  return new Date(scheduledFor).getTime() <= now.getTime() + MEDICATION_EARLY_ACTION_MS;
}
export function canConfirmAppointment(startsAt: string, now = new Date()) {
  const offset = now.getTime() - new Date(startsAt).getTime();
  return offset >= -APPOINTMENT_CHECK_IN_BEFORE_MS && offset <= APPOINTMENT_CHECK_IN_AFTER_MS;
}
export function canConfirmActivity(startsAt: string, now = new Date()) {
  return new Date(startsAt).getTime() <= now.getTime();
}
