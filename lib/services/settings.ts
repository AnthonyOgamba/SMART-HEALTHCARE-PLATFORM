import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Authentication is required to access settings.');
  return data.user.id;
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateUserSettings(values: UserSettingsUpdate): Promise<UserSettings> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('user_settings')
    .update(values)
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

const onboardingKey = (userId: string) => `genie_cares_onboarding_completed:${userId}`;

export async function getLocalOnboardingComplete(userId: string): Promise<boolean> {
  return (await AsyncStorage.getItem(onboardingKey(userId))) === 'true';
}

export async function completeOnboarding(userId: string): Promise<void> {
  // Persist locally first so a missing/unapplied remote column cannot trap the
  // user in onboarding. The key is account-scoped for shared devices.
  await AsyncStorage.setItem(onboardingKey(userId), 'true');
  void updateUserSettings({ onboarding_completed_at: new Date().toISOString() }).catch((error) => {
    if (__DEV__) console.debug('[Onboarding] Remote completion sync deferred', error);
  });
}
