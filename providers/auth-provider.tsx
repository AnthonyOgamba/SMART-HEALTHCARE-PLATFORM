import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { useRouter, useSegments } from 'expo-router';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';

import { getSession, handleAuthUrl, onAuthStateChange } from '@/lib/services/auth';
import { supabase } from '@/lib/supabase/client';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const PUBLIC_ROUTES = new Set(['', 'signup', 'forgot-password', 'reset-password', 'reset-success']);
const AUTH_ENTRY_ROUTES = new Set(['', 'signup', 'forgot-password']);
const OUT_OF_SCOPE_ROUTES = new Set(['analytics', 'wearable-data']);

export function AuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSession()
      .then((nextSession) => {
        if (active) setSession(nextSession);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const subscription = onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const processUrl = (url: string | null) => {
      if (!url) return;
      handleAuthUrl(url).catch(() => undefined);
    };
    Linking.getInitialURL().then(processUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => processUrl(url));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (loading) return;
    const root = segments[0] ?? '';
    if (!session && !PUBLIC_ROUTES.has(root)) router.replace('/');
    if (session && AUTH_ENTRY_ROUTES.has(root)) router.replace('/(tabs)/home');
    if (session && OUT_OF_SCOPE_ROUTES.has(root)) router.replace('/(tabs)/home');
  }, [loading, router, segments, session]);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, loading }),
    [loading, session],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
