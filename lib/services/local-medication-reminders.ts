import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Medication, MedicationSchedule } from '@/types';
import { getMedicationReminderSound } from '@/lib/notification-sounds';

const STORAGE_KEY = 'healthnexus.medication-reminder-identifiers.v1';
type ReminderMap = Record<string, string>;
const CHANNEL_VERSION = 1;

function bundledSounds(): string[] {
  const value = Constants.expoConfig?.extra?.bundledMedicationReminderSounds;
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function resolvedSound(logicalSound: Medication['reminderSound']) {
  const selected = getMedicationReminderSound(logicalSound);
  const filename = selected.filename && bundledSounds().includes(selected.filename)
    ? selected.filename
    : null;
  return {
    filename,
    channelId: `medication-reminders-v${CHANNEL_VERSION}-${filename ? selected.key : 'default'}`,
    label: filename ? selected.label : 'Default',
  };
}

async function ensureAndroidChannel(logicalSound: Medication['reminderSound']) {
  const sound = resolvedSound(logicalSound);
  if (Platform.OS !== 'android') return sound;
  const existing = await Notifications.getNotificationChannelAsync(sound.channelId);
  if (!existing) {
    await Notifications.setNotificationChannelAsync(sound.channelId, {
      name: `Medication reminders — ${sound.label}`,
      importance: Notifications.AndroidImportance.HIGH,
      sound: sound.filename ?? 'default',
    });
  }
  return sound;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function identifiers(): Promise<ReminderMap> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  return value ? JSON.parse(value) as ReminderMap : {};
}
async function save(value: ReminderMap) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export async function requestMedicationReminderPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    await ensureAndroidChannel('default');
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export async function cancelMedicationReminders(scheduleIds: string[]) {
  const stored = await identifiers();
  for (const scheduleId of scheduleIds) {
    const notificationId = stored[scheduleId];
    if (notificationId) await Notifications.cancelScheduledNotificationAsync(notificationId);
    delete stored[scheduleId];
  }
  await save(stored);
}

export async function scheduleMedicationReminders(
  medicationValue: Medication,
  schedules: MedicationSchedule[],
): Promise<boolean> {
  if (!(await requestMedicationReminderPermission())) return false;
  const sound = await ensureAndroidChannel(medicationValue.reminderSound);
  await cancelMedicationReminders(schedules.map((item) => item.id));
  const stored = await identifiers();
  for (const item of schedules.filter((value) => value.active)) {
    const [hour, minute] = item.timeOfDay.split(':').map(Number);
    stored[item.id] = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Medication Reminder',
        body: `Time to take ${medicationValue.name} (${medicationValue.dose}).`,
        data: { medicationId: medicationValue.id, scheduleId: item.id },
        sound: sound.filename ?? 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: Platform.OS === 'android' ? sound.channelId : undefined,
      },
    });
  }
  await save(stored);
  return true;
}

export async function reconcileMedicationReminders(
  medications: Array<{ medication: Medication; schedules: MedicationSchedule[] }>,
  enabled: boolean,
) {
  const stored = await identifiers();
  const activeIds = new Set(medications.flatMap((item) => item.schedules.filter((s) => s.active).map((s) => s.id)));
  await cancelMedicationReminders(Object.keys(stored).filter((id) => !enabled || !activeIds.has(id)));
  if (!enabled) return false;
  let permission = true;
  for (const item of medications) {
    permission = (await scheduleMedicationReminders(item.medication, item.schedules)) && permission;
  }
  return permission;
}
