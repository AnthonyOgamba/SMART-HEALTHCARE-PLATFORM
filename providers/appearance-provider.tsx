import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { getUserSettings, updateUserSettings } from '@/lib/services/settings';
import { useAuth } from '@/providers/auth-provider';

export type Appearance = 'light' | 'dark';
interface AppearanceContextValue { appearance: Appearance; loading: boolean; setAppearance: (value: Appearance) => Promise<void> }
const AppearanceContext = createContext<AppearanceContextValue | undefined>(undefined);

export function AppearanceProvider({ children }: PropsWithChildren) {
  const { user, loading: authLoading } = useAuth();
  const [appearance, setAppearanceState] = useState<Appearance>('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (authLoading) return;
    if (!user) { setAppearanceState('light'); setLoading(false); return; }
    setLoading(true);
    getUserSettings().then(settings => {
      if (active) setAppearanceState(settings?.appearance === 'dark' ? 'dark' : 'light');
    }).catch(error => {
      if (__DEV__) console.debug('[Appearance] Could not restore preference', error);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authLoading, user]);

  const setAppearance = useCallback(async (value: Appearance) => {
    const previous = appearance;
    setAppearanceState(value);
    try { await updateUserSettings({ appearance: value }); }
    catch (error) { setAppearanceState(previous); throw error; }
  }, [appearance]);

  const context = useMemo(() => ({ appearance, loading, setAppearance }), [appearance, loading, setAppearance]);
  const navigationTheme = appearance === 'dark' ? DarkTheme : DefaultTheme;
  return <AppearanceContext.Provider value={context}><NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider></AppearanceContext.Provider>;
}

export function useAppearance() {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error('useAppearance must be used inside AppearanceProvider.');
  return value;
}
