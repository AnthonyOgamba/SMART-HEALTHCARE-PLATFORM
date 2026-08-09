import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AuthFooterLink } from '@/components/ui/auth-footer-link';
import { AuthLayout } from '@/components/ui/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spacing } from '@/constants/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setError(undefined);
    setSubmitting(true);
    try {
      // TODO: Member 1 owns auth — swap for e.g. api.post('/auth/forgot-password', { email })
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push('/reset-success');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email address and we'll send you a link to reset your password.">
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
          if (error) setError(undefined);
        }}
        error={error}
      />

      <View style={{ marginTop: Spacing.sm }}>
        <Button label="Send Reset Link" icon="arrow-forward" onPress={handleSubmit} loading={submitting} />
      </View>

      <AuthFooterLink
        prompt="Remembered your password?"
        linkLabel="Return to Login"
        onPress={() => router.push('/')}
      />
    </AuthLayout>
  );
}
