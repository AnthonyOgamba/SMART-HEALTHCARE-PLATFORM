export const MEDICATION_REMINDER_SOUNDS = [
  { key: 'default', label: 'Default', filename: null },
  { key: 'gentle_chime', label: 'Gentle Chime', filename: 'medication_gentle_chime.wav' },
  { key: 'soft_bell', label: 'Soft Bell', filename: 'medication_soft_bell.wav' },
  { key: 'bright_alert', label: 'Bright Alert', filename: 'medication_bright_alert.wav' },
  { key: 'calm_tone', label: 'Calm Tone', filename: 'medication_calm_tone.wav' },
  { key: 'classic_reminder', label: 'Classic Reminder', filename: 'medication_classic_reminder.wav' },
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
