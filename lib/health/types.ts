export type HealthProviderId = 'phone_pedometer' | 'apple_health' | 'health_connect';

export type HealthAvailability = 'available' | 'permission_required' | 'unavailable' | 'permission_denied' | 'unsupported' | 'error';

export type DailyActivitySnapshot = {
  date: string;
  steps: number | null;
  source: 'phone_pedometer';
  capturedAt: string;
};

export type HealthProviderStatus = {
  id: HealthProviderId;
  availability: HealthAvailability;
  label: string;
};

export interface HealthProvider {
  readonly id: HealthProviderId;
  getStatus(): Promise<HealthProviderStatus>;
  getDailyActivity(date?: Date): Promise<DailyActivitySnapshot>;
  subscribeToSteps?(listener: (stepsSinceSubscription: number) => void): () => void;
}
