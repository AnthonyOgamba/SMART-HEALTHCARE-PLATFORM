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
  assert.match(provider, /if \(!session && !PUBLIC_ROUTES\.has\(root\)\) router\.replace\('\/'\)/);
  assert.match(client, /persistSession:\s*true/);
  assert.match(client, /AsyncStorage/);
});
