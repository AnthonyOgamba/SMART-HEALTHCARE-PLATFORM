import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { useRouter, useSegments } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';

import { getSession, handleAuthUrl, onAuthStateChange } from '@/lib/services/auth';
import { supabase } from '@/lib/supabase/client';
import { getLocalOnboardingComplete, getUserSettings } from '@/lib/services/settings';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  onboardingLoading: boolean;
  onboardingComplete: boolean | null;
  refreshOnboarding: () => Promise<void>;
  markOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const PUBLIC_ROUTES = new Set([
  '',
  'welcome',
  'login',
  'signup',
  'forgot-password',
  'reset-password',
  'reset-success',
  'terms-and-conditions',
]);
const AUTH_ENTRY_ROUTES = new Set(['', 'welcome', 'login', 'signup', 'forgot-password', 'reset-success']);

export function AuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingLoading, setOnboardingLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const sessionUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    getSession()
      .then((nextSession) => {
        if (active) {
          sessionUserIdRef.current = nextSession?.user.id ?? null;
          setSession(nextSession);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const subscription = onAuthStateChange((event, nextSession) => {
      const nextUserId = nextSession?.user.id ?? null;
      const accountChanged = sessionUserIdRef.current !== nextUserId;
      sessionUserIdRef.current = nextUserId;
      setSession(nextSession);
      if (event === 'SIGNED_OUT' || !nextSession) {
        setOnboardingComplete(null);
        setOnboardingLoading(false);
      } else if (accountChanged) {
        // Never carry User A's onboarding state into User B's session.
        setOnboardingComplete(null);
        setOnboardingLoading(true);
      }
      // Auth events can finish initial bootstrap, but TOKEN_REFRESHED and other
      // ordinary events never set loading back to true or unmount navigation.
      setLoading(false);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id ?? null;
  const refreshOnboarding = useCallback(async () => {
    if (!userId) { setOnboardingComplete(null); setOnboardingLoading(false); return; }
    const requestedUserId = userId;
    setOnboardingLoading(true);
    try {
      const localComplete = await getLocalOnboardingComplete(requestedUserId);
      if (sessionUserIdRef.current !== requestedUserId) return;
      if (localComplete) { setOnboardingComplete(true); return; }
      const settings = await getUserSettings();
      if (sessionUserIdRef.current !== requestedUserId) return;
      setOnboardingComplete(Boolean(settings?.onboarding_completed_at));
    }
    catch (error) {
      if (__DEV__) console.debug('[Onboarding] Remote completion state unavailable; using account-scoped local state', error);
      if (sessionUserIdRef.current === requestedUserId) setOnboardingComplete(false);
    }
    finally {
      if (sessionUserIdRef.current === requestedUserId) setOnboardingLoading(false);
    }
  }, [userId]);

  const markOnboardingComplete = useCallback(() => {
    setOnboardingComplete(true);
    setOnboardingLoading(false);
    if (__DEV__) console.debug('[Onboarding] in-memory completion=true');
  }, []);

  useEffect(() => { void refreshOnboarding(); }, [refreshOnboarding]);

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
    if (loading || onboardingLoading) return;
    const root = segments[0] ?? '';
    if (!session && !PUBLIC_ROUTES.has(root)) router.replace('/welcome');
    if (session && onboardingComplete === false && root !== 'onboarding') router.replace('/onboarding');
    // Onboarding owns its one completion transition. Redirecting it here too
    // causes two competing REPLACE actions on iOS.
    if (session && onboardingComplete && AUTH_ENTRY_ROUTES.has(root)) router.replace('/(tabs)/home');
  }, [loading, onboardingLoading, onboardingComplete, router, segments, session]);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, loading, onboardingLoading, onboardingComplete, refreshOnboarding, markOnboardingComplete }),
    [loading, onboardingLoading, onboardingComplete, refreshOnboarding, markOnboardingComplete, session],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
