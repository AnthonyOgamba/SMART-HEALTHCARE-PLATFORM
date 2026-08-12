# Backend Phase 1 verification

## Automated local checks

- `npm run typecheck` validates application and regenerated Expo Router types.
- `npm run lint` validates the Expo/React Native source.
- `npm run test:phase1` verifies migration scope, signup triggers, RLS declarations,
  append-only consent permissions, auth service coverage, and protected-route logic.

## Supabase integration checklist

These checks require a linked Supabase development project and two disposable test users.
Never run them against production.

1. Sign up User A and verify that `profiles` and `user_settings` rows are created.
2. Attempt the same signup again. Supabase may return an obfuscated success response when
   email confirmation is enabled to prevent account enumeration; verify that no duplicate
   `auth.users` row is created rather than relying only on a client-visible error.
3. Confirm User A can log in with the correct password.
4. Confirm an incorrect password returns an Auth error and does not create a session.
5. Restart the app and confirm the AsyncStorage-backed session is restored.
6. Sign out and confirm the session is cleared.
7. Open a protected deep link while signed out and confirm redirection to `/`.
8. As User A, query User B's `profiles.user_id`; expect zero rows.
9. As User A, update User B's `user_settings.user_id`; expect zero updated rows.
10. Call `record_consent` twice, verify two history rows, then attempt update/delete through
    the client; expect permission denied or zero accessible rows.
11. Request a password reset and verify the email link opens `/reset-password`.
12. Update User A's profile and confirm Auth email is unchanged and not stored in `profiles`.

## SQL ownership probes

Using each user's access token with the Supabase client:

```ts
await userA.from('profiles').select('*').eq('user_id', userBId); // []
await userA.from('user_settings').update({ ai_enabled: false }).eq('user_id', userBId); // []
await userA.from('consents').update({ granted: false }).eq('id', consentId); // denied
await userA.from('consents').delete().eq('id', consentId); // denied
```

The migration must be applied before running these integration checks.
