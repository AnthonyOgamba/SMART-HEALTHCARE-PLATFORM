import { PedometerProvider } from './pedometer-provider';
import type { DailyActivitySnapshot, HealthProviderStatus } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const phoneProvider = new PedometerProvider();
let activeCleanup: (() => void) | null = null;
let subscriberCount = 0;
let liveBaselineSteps = 0;
const subscribers = new Set<(stepsSinceSubscription: number) => void>();
const stateSubscribers = new Set<() => void>();
export type PhoneActivityState = Readonly<{ snapshot: DailyActivitySnapshot | null; status: HealthProviderStatus | null }>;
const SERVER_STATE: PhoneActivityState = Object.freeze({ snapshot: null, status: null });
let currentState: PhoneActivityState = SERVER_STATE;
let activeUserId: string | null = null;
const connectionKey = (userId: string) => `genie_cares_phone_activity_connected:${userId}`;

function sameSnapshot(left: DailyActivitySnapshot | null, right: DailyActivitySnapshot | null) {
  return left === right || (!!left && !!right && left.date === right.date && left.steps === right.steps && left.source === right.source);
}

function sameStatus(left: HealthProviderStatus | null, right: HealthProviderStatus | null) {
  return left === right || (!!left && !!right && left.id === right.id && left.availability === right.availability && left.label === right.label);
}

function publish(snapshot: DailyActivitySnapshot | null, status: HealthProviderStatus | null) {
  if (sameSnapshot(currentState.snapshot, snapshot) && sameStatus(currentState.status, status)) return currentState;
  currentState = Object.freeze({ snapshot, status });
  stateSubscribers.forEach(listener => listener());
  return currentState;
}

async function refreshActivity(userId = activeUserId) {
  if (!userId || userId !== activeUserId || await AsyncStorage.getItem(connectionKey(userId)) !== 'true') {
    return publish(null, { id: 'phone_pedometer', availability: 'permission_required', label: 'Connect Phone Activity' });
  }
  const status = await phoneProvider.getStatus();
  const snapshot = status.availability === 'available' ? await phoneProvider.getDailyActivity() : { date: new Date().toISOString().slice(0, 10), steps: null, source: 'phone_pedometer' as const, capturedAt: new Date().toISOString() };
  return publish(snapshot, status);
}

export const healthService = {
  getTodayActivity: async (): Promise<DailyActivitySnapshot> => (await refreshActivity()).snapshot!,
  getPhoneStatus: (): Promise<HealthProviderStatus> => activeUserId ? phoneProvider.getStatus() : Promise.resolve({ id: 'phone_pedometer', availability: 'permission_required', label: 'Connect Phone Activity' }),
  getAppleHealthStatus: async (): Promise<HealthProviderStatus> => ({ id: 'apple_health', availability: 'unsupported', label: 'Not Connected' }),
  getState: () => currentState,
  getServerState: () => SERVER_STATE,
  subscribeState(listener: () => void) { stateSubscribers.add(listener); return () => stateSubscribers.delete(listener); },
  setActiveUser(userId: string | null) {
    if (activeUserId === userId) return;
    activeCleanup?.(); activeCleanup = null; subscriberCount = 0; subscribers.clear(); liveBaselineSteps = 0;
    activeUserId = userId;
    publish(null, userId ? { id: 'phone_pedometer', availability: 'permission_required', label: 'Connect Phone Activity' } : null);
  },
  refresh: refreshActivity,
  async connectPhoneActivity(userId = activeUserId) {
    if (!userId || userId !== activeUserId) return publish(null, { id: 'phone_pedometer', availability: 'permission_required', label: 'Connect Phone Activity' });
    const granted = await phoneProvider.requestPermission();
    if (granted) await AsyncStorage.setItem(connectionKey(userId), 'true');
    return refreshActivity(userId);
  },
  subscribeToLiveSteps(listener: (stepsSinceSubscription: number) => void) {
    subscribers.add(listener);
    subscriberCount += 1;
    if (!activeCleanup) {
      liveBaselineSteps = currentState.snapshot?.steps ?? 0;
      activeCleanup = phoneProvider.subscribeToSteps?.((steps) => {
        subscribers.forEach((subscriber) => subscriber(steps));
        const snapshot = currentState.snapshot;
        if (snapshot?.steps !== null && snapshot) publish({ ...snapshot, steps: liveBaselineSteps + steps, capturedAt: new Date().toISOString() }, currentState.status);
      }) ?? null;
    }
    let removed = false;
    return () => {
      if (removed) return;
      removed = true;
      subscribers.delete(listener);
      subscriberCount -= 1;
      if (subscriberCount === 0) {
        activeCleanup?.();
        activeCleanup = null;
        liveBaselineSteps = 0;
      }
    };
  },
};
