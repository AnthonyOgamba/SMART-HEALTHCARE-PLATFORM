export const MEDICATION_REMINDER_SOUNDS = [
  { key: 'default', label: 'Default', filename: null },
  { key: 'classic_reminder', label: 'Digital Alarm', filename: 'alarm-clock-digital-beeping.wav' },
  { key: 'bright_alert', label: 'Urgent Siren', filename: 'air-raid-siren-wailing-urgent.wav' },
] as const;

export type MedicationReminderSound = (typeof MEDICATION_REMINDER_SOUNDS)[number]['key'];

export const DEFAULT_MEDICATION_REMINDER_SOUND: MedicationReminderSound = 'default';

export function isMedicationReminderSound(value: unknown): value is MedicationReminderSound {
  return MEDICATION_REMINDER_SOUNDS.some((option) => option.key === value);
}

export function getMedicationReminderSound(value: unknown) {
  return MEDICATION_REMINDER_SOUNDS.find((option) => option.key === value)
    ?? MEDICATION_REMINDER_SOUNDS[0];
}
