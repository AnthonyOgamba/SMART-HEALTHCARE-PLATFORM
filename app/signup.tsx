import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AuthFooterLink } from '@/components/ui/auth-footer-link';
import { AuthLayout } from '@/components/ui/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spacing } from '@/constants/theme';

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
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
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

  const setField = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async () => {
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      // TODO: Member 1 owns auth — swap for the real signup endpoint,
      // e.g. await api.post('/auth/signup', { ...form }), then store the
      // returned token via setAuthToken() and navigate into the app.
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.replace('/(tabs)/home');
    } catch {
      setErrors({ email: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join HealthNexus to manage your health journey securely.">
      <Input
        label="Full Name"
        icon="person-outline"
        placeholder="John Doe"
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
        placeholder="+1 (555) 000-0000"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={setField('phone')}
        error={errors.phone}
      />

      <Input
        label="Password"
        icon="lock-outline"
        placeholder="••••••••"
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
        placeholder="••••••••"
        secureTextEntry={!showConfirmPassword}
        value={form.confirmPassword}
        onChangeText={setField('confirmPassword')}
        error={errors.confirmPassword}
        rightIcon={showConfirmPassword ? 'visibility-off' : 'visibility'}
        onRightIconPress={() => setShowConfirmPassword((prev) => !prev)}
        rightIconAccessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
      />

      <View style={{ marginTop: Spacing.sm }}>
        <Button
          label="Create Account"
          icon="arrow-forward"
          onPress={handleSubmit}
          loading={submitting}
        />
      </View>

      <AuthFooterLink
        prompt="Already have an account?"
        linkLabel="Login"
        onPress={() => router.push('/')}
      />
    </AuthLayout>
  );
}
