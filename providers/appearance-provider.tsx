import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

import { getUserSettings, updateUserSettings } from '@/lib/services/settings';
import { useAuth } from '@/providers/auth-provider';

export type Appearance = 'light' | 'dark';
interface AppearanceContextValue { appearance: Appearance; loading: boolean; setAppearance: (value: Appearance) => Promise<void> }
const AppearanceContext = createContext<AppearanceContextValue | undefined>(undefined);
const APPEARANCE_KEY = 'genie_cares_last_appearance';

export function AppearanceProvider({ children }: PropsWithChildren) {
  const { user, loading: authLoading } = useAuth();
  const systemAppearance = useColorScheme();
  const [appearance, setAppearanceState] = useState<Appearance>(() => systemAppearance === 'dark' ? 'dark' : 'light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (authLoading) return;
    if (!user) { AsyncStorage.getItem(APPEARANCE_KEY).then(value => { if (active && (value === 'light' || value === 'dark')) setAppearanceState(value); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }
    setLoading(true);
    getUserSettings().then(settings => {
      if (active) { const value = settings?.appearance === 'dark' ? 'dark' : 'light'; setAppearanceState(value); void AsyncStorage.setItem(APPEARANCE_KEY, value); }
    }).catch(error => {
      if (__DEV__) console.debug('[Appearance] Could not restore preference', error);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authLoading, user]);

  const setAppearance = useCallback(async (value: Appearance) => {
    const previous = appearance;
    if (__DEV__) console.debug('[Appearance] button pressed', { previous, requested: value });
    setAppearanceState(value);
    if (__DEV__) console.debug('[Appearance] provider updated', { previous, requested: value, active: value });
    try {
      await AsyncStorage.setItem(APPEARANCE_KEY, value);
      if (user) await updateUserSettings({ appearance: value });
      if (__DEV__) console.debug('[Appearance] persistence success', { active: value });
    } catch (error) {
      // Preserve the user's visible selection and durable local fallback even
      // when remote persistence is temporarily unavailable.
      if (__DEV__) console.debug('[Appearance] remote persistence deferred', error);
      throw error;
    }
  }, [appearance, user]);

  const context = useMemo(() => ({ appearance, loading, setAppearance }), [appearance, loading, setAppearance]);
  const navigationTheme = useMemo(() => {
    const base = appearance === 'dark' ? DarkTheme : DefaultTheme;
    const colors = appearance === 'dark'
      ? { ...base.colors, primary: '#6FA8DC', background: '#14161A', card: '#1E2126', text: '#F1F3F5', border: '#2C3038', notification: '#6FA8DC' }
      : { ...base.colors, primary: '#1B4F72', background: '#F7F8FA', card: '#FFFFFF', text: '#1A202C', border: '#EEF1F4', notification: '#2B6CB0' };
    if (__DEV__) console.debug('[Appearance] active palette', appearance);
    return { ...base, colors };
  }, [appearance]);
  return <AppearanceContext.Provider value={context}><NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider></AppearanceContext.Provider>;
}

export function useAppearance() {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error('useAppearance must be used inside AppearanceProvider.');
  return value;
}
