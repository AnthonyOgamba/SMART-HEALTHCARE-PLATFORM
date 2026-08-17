import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { AuthFooterLink } from '@/components/ui/auth-footer-link';
import { AuthLayout } from '@/components/ui/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TermsAgreement } from '@/components/ui/terms-agreement';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { signUp } from '@/lib/services/auth';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required.';
  }

  if (!form.password) {
    errors.password = 'Password is required.';
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(form.password)) {
    errors.password = 'Use at least one uppercase letter, lowercase letter, number, and special character.';
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

function signupError(error: unknown): FormErrors {
  const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
  if (/password|character|uppercase|lowercase|digit|number|symbol/i.test(message)) {
    return { password: 'Use at least 8 characters with an uppercase letter, lowercase letter, number, and special character.' };
  }
  if (/email|already registered|already exists|user already/i.test(message)) return { email: message };
  if (/phone/i.test(message)) return { phone: message };
  return { form: message };
}

export default function SignupScreen() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const setField = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async () => {
    if (!termsAccepted) return;
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      // TODO: Member 1 owns auth — swap for the real signup endpoint,
      // e.g. await api.post('/auth/signup', { ...form }), then store the
      // returned token via setAuthToken() and navigate into the app.
      const result = await signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone,
      });
      if (result.session) {
        // AuthProvider performs the onboarding-aware redirect.
      } else {
        Alert.alert(
          'Verify Your Email',
          'We sent a verification link to your email address. Verify your email before logging in.',
          [{ text: 'Return to Login', onPress: () => router.replace('/login') }],
        );
      }
    } catch (error) {
      setErrors(signupError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Join Genie Cares and take charge of your health."
      brandedMascot
      style={{ padding: Spacing.md, gap: 11 }}>
      <Input
        label="Full Name"
        icon="person-outline"
        placeholder="Enter your full name"
        autoCapitalize="words"
        value={form.fullName}
        onChangeText={setField('fullName')}
        error={errors.fullName}
      />

      <Input
        label="Email"
        icon="mail-outline"
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={form.email}
        onChangeText={setField('email')}
        error={errors.email}
      />

      <Input
        label="Phone Number"
        icon="call"
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={setField('phone')}
        error={errors.phone}
      />

      <Input
        label="Password"
        icon="lock-outline"
        placeholder="Create a password"
        secureTextEntry={!showPassword}
        value={form.password}
        onChangeText={setField('password')}
        error={errors.password}
        rightIcon={showPassword ? 'visibility-off' : 'visibility'}
        onRightIconPress={() => setShowPassword((prev) => !prev)}
        rightIconAccessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
      />

      <Input
        label="Confirm Password"
        icon="lock-outline"
        placeholder="Confirm your password"
        secureTextEntry={!showConfirmPassword}
        value={form.confirmPassword}
        onChangeText={setField('confirmPassword')}
        error={errors.confirmPassword}
        rightIcon={showConfirmPassword ? 'visibility-off' : 'visibility'}
        onRightIconPress={() => setShowConfirmPassword((prev) => !prev)}
        rightIconAccessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
      />

      <View style={{ marginTop: Spacing.sm }}>
        {errors.form ? <ThemedText style={{ color: '#C62828', marginBottom: Spacing.sm }} accessibilityLiveRegion="polite">{errors.form}</ThemedText> : null}
        <TermsAgreement
          accepted={termsAccepted}
          onAcceptedChange={setTermsAccepted}
          onTermsPress={() => router.push('/terms-and-conditions')}
          onPrivacyPress={() => router.push('/privacy-policy')}
          error={!termsAccepted ? 'Acceptance is required to create an account.' : undefined}
        />
        <Button
          label="Create Account"
          icon="arrow-forward"
          onPress={handleSubmit}
          loading={submitting}
          disabled={!termsAccepted}
          style={{ marginTop: Spacing.md }}
        />
      </View>

      <AuthFooterLink
        prompt="Already have an account?"
        linkLabel="Login"
        onPress={() => router.push('/login')}
      />
    </AuthLayout>
  );
}
