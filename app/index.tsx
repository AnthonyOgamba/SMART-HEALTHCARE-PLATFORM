import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AuthFooterLink } from '@/components/ui/auth-footer-link';
import { AuthLayout } from '@/components/ui/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TermsAgreement } from '@/components/ui/terms-agreement';
import { Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';
import { signIn } from '@/lib/services/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = async () => {
    const nextErrors: FormErrors = {};
    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      nextErrors.password = 'Password is required.';
    }
    if (!termsAccepted) return;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      // TODO: Member 1 owns auth — swap for the real login endpoint,
      // e.g. const { token } = await api.post('/auth/login', { email, password });
      // then setAuthToken(token) before navigating.
      await signIn(email, password);
      router.replace('/(tabs)/home');
    } catch (error) {
      setErrors({
        password: error instanceof Error ? error.message : 'Incorrect email or password.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Log in to continue managing your health journey.">
      <Input
        label="Email"
        icon="mail-outline"
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
        }}
        error={errors.email}
      />

      <Input
        label="Password"
        icon="lock-outline"
        placeholder="••••••••"
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
        }}
        error={errors.password}
        rightIcon={showPassword ? 'visibility-off' : 'visibility'}
        onRightIconPress={() => setShowPassword((prev) => !prev)}
        rightIconAccessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
      />

      <View style={styles.forgotRow}>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Forgot password"
          onPress={() => router.push('/forgot-password')}>
          <ThemedText style={styles.forgotLink}>Forgot password?</ThemedText>
        </Pressable>
      </View>

      <TermsAgreement
        accepted={termsAccepted}
        onAcceptedChange={setTermsAccepted}
        onTermsPress={() => router.push('/terms-and-conditions')}
        error={!termsAccepted ? 'Acceptance is required to sign in.' : undefined}
      />

      <Button
        label="Login"
        icon="arrow-forward"
        onPress={handleSubmit}
        loading={submitting}
        disabled={!termsAccepted}
      />

      <AuthFooterLink
        prompt="Don't have an account?"
        linkLabel="Create Account"
        onPress={() => router.push('/signup')}
      />
    </AuthLayout>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    forgotRow: {
      alignItems: 'flex-end',
      marginTop: -Spacing.xs,
    },
    forgotLink: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.accent,
    },
  });
