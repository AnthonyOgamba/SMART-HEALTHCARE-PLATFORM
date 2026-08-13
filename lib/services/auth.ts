import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import { supabase } from '@/lib/supabase/client';

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export async function signUp({ email, password, fullName, phone }: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { full_name: fullName.trim(), phone: phone.trim() || null },
      emailRedirectTo: Linking.createURL('/'),
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  return supabase.auth.onAuthStateChange(callback).data.subscription;
}

export async function resetPasswordForEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: Linking.createURL('/reset-password'),
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session) throw new Error('Authentication is required to change your password.');
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data.user;
}

export async function handleAuthUrl(url: string) {
  const parsed = Linking.parse(url);
  const params = parsed.queryParams ?? {};
  const code = typeof params.code === 'string' ? params.code : null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  const fragment = url.includes('#') ? new URLSearchParams(url.split('#')[1]) : null;
  const accessToken =
    typeof params.access_token === 'string' ? params.access_token : fragment?.get('access_token');
  const refreshToken =
    typeof params.refresh_token === 'string' ? params.refresh_token : fragment?.get('refresh_token');

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
  }
}
