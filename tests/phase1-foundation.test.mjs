import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(
  new URL('../supabase/migrations/202608120001_backend_foundation.sql', import.meta.url),
  'utf8',
);
const authService = readFileSync(new URL('../lib/services/auth.ts', import.meta.url), 'utf8');
const provider = readFileSync(new URL('../providers/auth-provider.tsx', import.meta.url), 'utf8');
const client = readFileSync(new URL('../lib/supabase/client.ts', import.meta.url), 'utf8');
const homeScreen = readFileSync(new URL('../app/(tabs)/home.tsx', import.meta.url), 'utf8');
const loginScreen = readFileSync(new URL('../app/index.tsx', import.meta.url), 'utf8');
const signupScreen = readFileSync(new URL('../app/signup.tsx', import.meta.url), 'utf8');
const profileProvider = readFileSync(new URL('../providers/profile-provider.tsx', import.meta.url), 'utf8');
const profileService = readFileSync(new URL('../lib/services/profile.ts', import.meta.url), 'utf8');
const securityHardening = readFileSync(
  new URL('../supabase/migrations/202608130003_security_definer_hardening.sql', import.meta.url),
  'utf8',
);

test('Phase 1 creates only the approved application tables', () => {
  const tables = [...migration.matchAll(/create table public\.([a-z_]+)/g)].map((match) => match[1]);
  assert.deepEqual(tables, ['profiles', 'user_settings', 'consents']);
});

test('profile and settings rows are created by the auth signup trigger', () => {
  assert.match(migration, /after insert on auth\.users/);
  assert.match(migration, /insert into public\.profiles/);
  assert.match(migration, /insert into public\.user_settings/);
});

test('all Phase 1 tables enable RLS and own-row policies use auth.uid()', () => {
  for (const table of ['profiles', 'user_settings', 'consents']) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
  }
  assert.match(migration, /profiles_select_own[\s\S]*auth\.uid\(\)/);
  assert.match(migration, /user_settings_select_own[\s\S]*auth\.uid\(\)/);
  assert.match(migration, /consents_select_own[\s\S]*auth\.uid\(\)/);
});

test('consents are append-only and record_consent derives the caller', () => {
  assert.match(migration, /revoke insert, update, delete on public\.consents/);
  assert.match(migration, /caller_id := auth\.uid\(\)/);
  assert.doesNotMatch(migration, /create policy [^\n]*consents[^\n]*(insert|update|delete)/i);
  for (const type of ['health_data', 'ai_processing', 'notifications']) {
    assert.match(migration, new RegExp(`'${type}'`));
  }
  assert.doesNotMatch(migration, /wearable|analytics/i);
});

test('auth service covers every Phase 1 credential operation', () => {
  for (const operation of [
    'signUp',
    'signInWithPassword',
    'signOut',
    'getSession',
    'onAuthStateChange',
    'resetPasswordForEmail',
    'updateUser',
  ]) {
    assert.match(authService, new RegExp(operation));
  }
});

test('session provider protects private routes and restores sessions', () => {
  assert.match(provider, /getSession\(\)/);
  assert.match(provider, /onAuthStateChange/);
  assert.match(provider, /if \(!session && !PUBLIC_ROUTES\.has\(root\)\) router\.replace\('\/welcome'\)/);
  assert.match(client, /persistSession:\s*true/);
  assert.match(client, /AsyncStorage/);
});

test('Home greeting uses the shared authenticated profile and local time', () => {
  assert.doesNotMatch(homeScreen, /Good morning, Ema/);
  assert.match(homeScreen, /useProfile\(\)/);
  assert.match(homeScreen, /new Date\(\)\.getHours\(\)/);
  assert.match(homeScreen, /profile\?\.full_name\.trim\(\)\.split/);
});

test('Sign Up requires Terms acceptance while returning-user login does not', () => {
  assert.doesNotMatch(readFileSync(new URL('../app/login.tsx', import.meta.url), 'utf8'), /TermsAgreement|termsAccepted/);
  assert.match(signupScreen, /<TermsAgreement/);
  assert.match(signupScreen, /disabled=\{!termsAccepted\}/);
});

test('shared profile state reads and persists the authenticated profile', () => {
  assert.match(profileProvider, /getProfile\(\)/);
  assert.match(profileProvider, /updateProfile\(values\)/);
  assert.match(profileProvider, /setProfile\(updated\)/);
});

test('profile updates explicitly target the authenticated owner', () => {
  assert.match(profileService, /supabase\.auth\.getUser\(\)/);
  assert.match(profileService, /\.update\(values\)[\s\S]*\.eq\('user_id', userId\)[\s\S]*\.single\(\)/);
  assert.match(profileService, /ProfileUpdate = Database\['public'\]\['Tables'\]\['profiles'\]\['Update'\]/);
  assert.match(migration, /profiles_update_own[\s\S]*auth\.uid\(\)[\s\S]*user_id/);
});

test('record_consent remains a restricted authenticated-only definer RPC', () => {
  assert.match(migration, /record_consent[\s\S]*security definer[\s\S]*set search_path = ''/);
  assert.match(migration, /caller_id := auth\.uid\(\)/);
  assert.match(securityHardening, /revoke execute on function public\.record_consent\(text, boolean\) from public, anon/);
  assert.match(securityHardening, /grant execute on function public\.record_consent\(text, boolean\) to authenticated/);
});
