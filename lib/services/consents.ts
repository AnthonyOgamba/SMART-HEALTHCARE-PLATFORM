import { supabase } from '@/lib/supabase/client';
import type { ConsentType, Database } from '@/lib/supabase/database.types';

export type Consent = Database['public']['Tables']['consents']['Row'];
export type ConsentState = Record<ConsentType, Consent | null>;

export async function getLatestConsents(): Promise<ConsentState> {
  const { data, error } = await supabase
    .from('consents')
    .select('*')
    .order('recorded_at', { ascending: false });
  if (error) throw error;

  const state: ConsentState = {
    health_data: null,
    ai_processing: null,
    notifications: null,
  };
  for (const consent of data) {
    if (!state[consent.consent_type]) state[consent.consent_type] = consent;
  }
  return state;
}

export async function recordConsent(consentType: ConsentType, granted: boolean): Promise<Consent> {
  const { data, error } = await supabase.rpc('record_consent', {
    p_consent_type: consentType,
    p_granted: granted,
  });
  if (error) throw error;
  return data;
}
