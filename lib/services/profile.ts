import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error ?? new Error('Authentication is required to update your profile.');
  return data.user.id;
}

export async function getProfile(): Promise<Profile | null> {
  const userId = await requireUserId();
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(values: ProfileUpdate): Promise<Profile> {
  const userId = await requireUserId();
  const normalizePhone = (value: string | null | undefined) => value?.trim() ? `+${value.replace(/\D/g, '')}` : null;
  values = { ...values };
  if ('phone' in values) values.phone = normalizePhone(values.phone);
  if ('emergency_contact_phone' in values) values.emergency_contact_phone = normalizePhone(values.emergency_contact_phone);
  const { data, error } = await supabase
    .from('profiles')
    .update(values)
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) {
    if (__DEV__) console.debug('[Profile]', { operation: 'profile_update', userPresent: true, errorCode: error.code, errorMessage: error.message });
    throw error;
  }
  if (!data) throw new Error('The authenticated profile row is missing.');
  return data;
}
