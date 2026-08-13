import { Pedometer } from 'expo-sensors';

import type { DailyActivitySnapshot, HealthProvider, HealthProviderStatus } from './types';

export const localDateKey = (value = new Date()) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const localStartOfDay = (value = new Date()) => new Date(value.getFullYear(), value.getMonth(), value.getDate());

export class PedometerProvider implements HealthProvider {
  readonly id = 'phone_pedometer' as const;

  async getStatus(): Promise<HealthProviderStatus> {
    try {
      if (!(await Pedometer.isAvailableAsync())) return { id: this.id, availability: 'unavailable', label: 'Unavailable' };
      const permission = await Pedometer.getPermissionsAsync();
      if (!permission.granted && !permission.canAskAgain) return { id: this.id, availability: 'permission_denied', label: 'Permission denied' };
      return permission.granted ? { id: this.id, availability: 'available', label: 'Connected' } : { id: this.id, availability: 'permission_required', label: 'Permission Required' };
    } catch {
      return { id: this.id, availability: 'unsupported', label: 'Unsupported device' };
    }
  }

  async getDailyActivity(date = new Date()): Promise<DailyActivitySnapshot> {
    const capturedAt = new Date().toISOString();
    try {
      if (!(await Pedometer.isAvailableAsync())) return { date: localDateKey(date), steps: null, source: this.id, capturedAt };
      let permission = await Pedometer.getPermissionsAsync();
      if (!permission.granted) return { date: localDateKey(date), steps: null, source: this.id, capturedAt };
      const result = await Pedometer.getStepCountAsync(localStartOfDay(date), new Date());
      return { date: localDateKey(date), steps: Number.isFinite(result.steps) ? result.steps : null, source: this.id, capturedAt };
    } catch {
      return { date: localDateKey(date), steps: null, source: this.id, capturedAt };
    }
  }

  async requestPermission() { return (await Pedometer.requestPermissionsAsync()).granted; }

  subscribeToSteps(listener: (stepsSinceSubscription: number) => void) {
    const subscription = Pedometer.watchStepCount(({ steps }) => listener(steps));
    return () => subscription.remove();
  }
}
