import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

export async function getUserSettings(): Promise<UserSettings | null> {
  const { data, error } = await supabase.from('user_settings').select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateUserSettings(values: UserSettingsUpdate): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .update(values)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
