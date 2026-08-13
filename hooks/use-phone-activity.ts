import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { healthService } from '@/lib/health/health-service';
import type { DailyActivitySnapshot, HealthAvailability } from '@/lib/health/types';
import { useAuth } from '@/providers/auth-provider';

export function usePhoneActivity(live = true) {
  const { user } = useAuth();
  const state = useSyncExternalStore(healthService.subscribeState, healthService.getState, healthService.getServerState);
  const snapshot: DailyActivitySnapshot | null = state.snapshot;
  const availability: HealthAvailability = state.status?.availability ?? 'unavailable';
  const loading = state.status === null;

  const refresh = useCallback(async () => {
    await healthService.refresh();
  }, []);

  useEffect(() => {
    healthService.setActiveUser(user?.id ?? null);
    void healthService.refresh(user?.id ?? null);
  }, [user?.id]);
  useEffect(() => {
    if (!live || availability !== 'available' || snapshot?.steps === null || snapshot?.steps === undefined) return;
    return healthService.subscribeToLiveSteps(() => undefined);
  }, [availability, live, snapshot?.date]);

  const connect = useCallback(() => healthService.connectPhoneActivity(user?.id ?? null), [user?.id]);
  return { snapshot, availability, loading, refresh, connect };
}
