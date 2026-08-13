import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { LoadingState } from '@/components/ui/screen-states';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { ProfileProvider } from '@/providers/profile-provider';
import { MedicationReminderProvider } from '@/providers/medication-reminder-provider';
import { AppointmentReminderProvider } from '@/providers/appointment-reminder-provider';
import { AppearanceProvider, useAppearance } from '@/providers/appearance-provider';

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
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="signup" options={{headerShown:true,title:'Create Account',headerTintColor:'#1B4F72'}} />
      <Stack.Screen name="forgot-password" options={{headerShown:true,title:'Reset Password',headerTintColor:'#1B4F72'}} />
      <Stack.Screen name="reset-password" options={{headerShown:true,title:'Choose Password',headerTintColor:'#1B4F72'}} />
      <Stack.Screen name="reset-success" options={{headerShown:true,title:'Password Updated',headerTintColor:'#1B4F72'}} />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms-and-conditions" />
      <Stack.Screen name="consent-management" />
      <Stack.Screen name="security-center" />
      <Stack.Screen name="change-password" />
    </Stack>
    <StatusBar style={appearance === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppearanceProvider>
        <ProfileProvider>
          <MedicationReminderProvider>
            <AppointmentReminderProvider><RootNavigator /></AppointmentReminderProvider>
          </MedicationReminderProvider>
        </ProfileProvider>
      </AppearanceProvider>
    </AuthProvider>
  );
}
