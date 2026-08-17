import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LoadingState } from '@/components/ui/screen-states';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { ProfileProvider } from '@/providers/profile-provider';
import { MedicationReminderProvider } from '@/providers/medication-reminder-provider';
import { AppointmentReminderProvider } from '@/providers/appointment-reminder-provider';
import { AppearanceProvider, useAppearance } from '@/providers/appearance-provider';
import { NotificationNavigationProvider } from '@/providers/notification-navigation-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { loading } = useAuth();
  const { appearance } = useAppearance();

  if (loading) return <LoadingState label="Restoring your session..." />;

  return (
    <>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="reset-success" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="connected-health" />
      <Stack.Screen name="device-activity" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms-and-conditions" />
      <Stack.Screen name="consent-management" />
      <Stack.Screen name="security-center" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="onboarding" />
    </Stack>
    <StatusBar style={appearance === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}><AuthProvider>
      <AppearanceProvider>
        <ProfileProvider>
          <MedicationReminderProvider>
            <AppointmentReminderProvider><NotificationNavigationProvider><RootNavigator /></NotificationNavigationProvider></AppointmentReminderProvider>
          </MedicationReminderProvider>
        </ProfileProvider>
      </AppearanceProvider>
    </AuthProvider></GestureHandlerRootView>
  );
}
