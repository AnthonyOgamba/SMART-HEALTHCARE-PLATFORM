import { useEffect, type PropsWithChildren } from 'react';

import { reconcileMedicationReminders } from '@/lib/services/local-medication-reminders';
import { getActiveMedications } from '@/lib/services/medications';
import { getUserSettings } from '@/lib/services/settings';
import { useAuth } from '@/providers/auth-provider';

export function MedicationReminderProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    Promise.all([getActiveMedications(), getUserSettings()])
      .then(([medications, settings]) =>
        reconcileMedicationReminders(medications, settings?.medication_reminders ?? false),
      )
      .catch((error) => {
        if (__DEV__) console.debug('[MedicationReminders] Reconciliation unavailable', error);
      });
  }, [user]);
  return children;
}
