import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { LoadingState } from '@/components/ui/screen-states';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { ProfileProvider } from '@/providers/profile-provider';
import { MedicationReminderProvider } from '@/providers/medication-reminder-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { loading } = useAuth();

  if (loading) return <LoadingState label="Restoring your session..." />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="reset-success" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms-and-conditions" />
      <Stack.Screen name="consent-management" />
      <Stack.Screen name="security-center" />
    </Stack>
  );
}

export default function RootLayout() {
  // The approved designs are light-mode only, so we lock the app to the light
  // theme instead of following the device. This prevents near-white themed text
  // from rendering on the white card backgrounds (which made text invisible in
  // dark mode). If a dark theme is designed later, wire useColorScheme() back in.
  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <ProfileProvider>
          <MedicationReminderProvider>
            <RootNavigator />
          </MedicationReminderProvider>
        </ProfileProvider>
      </AuthProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
