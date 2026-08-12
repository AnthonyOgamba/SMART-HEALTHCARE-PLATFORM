import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { AuthLayout } from '@/components/ui/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spacing } from '@/constants/theme';
import { updatePassword } from '@/lib/services/auth';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError(undefined);
    try {
      await updatePassword(password);
      Alert.alert('Password Updated', 'Your password has been updated successfully.', [
        { text: 'Continue', onPress: () => router.replace('/(tabs)/home') },
      ]);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Could not update your password.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Choose a new password for your HealthNexus account.">
      <Input
        label="New Password"
        icon="lock-outline"
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={setPassword}
        error={error}
        rightIcon={showPassword ? 'visibility-off' : 'visibility'}
        onRightIconPress={() => setShowPassword((current) => !current)}
      />
      <Input
        label="Confirm Password"
        icon="lock-outline"
        secureTextEntry={!showPassword}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <View style={{ marginTop: Spacing.sm }}>
        <Button label="Update Password" onPress={handleSubmit} loading={submitting} />
      </View>
    </AuthLayout>
  );
}
