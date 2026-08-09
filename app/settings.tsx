import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { IconBadge } from '@/components/ui/icon-badge';
import { NavRow } from '@/components/ui/nav-row';
import { ScreenContainer } from '@/components/ui/screen-states';
import { SurfaceCard } from '@/components/ui/surface-card';
import { ToggleRow } from '@/components/ui/toggle-row';
import { Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [accessibility, setAccessibility] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated health data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Member 1 owns account/auth — call the real delete endpoint,
            // e.g. await api.delete('/account'), then clear the token and route out.
            router.replace('/');
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            hitSlop={8}>
            <MaterialIcons name="arrow-back" size={22} color={theme.iconDefault} />
          </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>
          Settings
        </ThemedText>
        </View>
      </View>

      <SurfaceCard>
        <View style={styles.cardHeader}>
          <IconBadge icon="notifications" color={theme.blueIcon} backgroundColor={theme.blueTint} size={30} />
          <ThemedText type="defaultSemiBold">Notification Preferences</ThemedText>
        </View>
        <ToggleRow
          icon="event-available"
          iconColor={theme.blueIcon}
          iconBackground={theme.blueTint}
          title="Appointment Reminders"
          description="Get notified about upcoming visits"
          value={appointmentReminders}
          onValueChange={setAppointmentReminders}
        />
        <ToggleRow
          icon="medication"
          iconColor={theme.blueIcon}
          iconBackground={theme.blueTint}
          title="Medication Reminders"
          description="Don't miss your daily dosage"
          value={medicationReminders}
          onValueChange={setMedicationReminders}
        />
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.cardHeader}>
          <IconBadge icon="settings" color={theme.amberIcon} backgroundColor={theme.amberTint} size={30} />
          <ThemedText type="defaultSemiBold">Appearance</ThemedText>
        </View>
        {/*
          Dark mode now follows the device's system setting automatically
          (see hooks/use-palette.ts). This toggle is a placeholder for a
          future manual override — wiring it up needs a small ColorScheme
          context so the choice can persist and override the system value.
        */}
        <ToggleRow
          icon="dark-mode"
          iconColor={theme.iconDefault}
          iconBackground={theme.grayTint}
          title="Dark Mode"
          description="Follows your device setting"
          value={false}
          onValueChange={() => {}}
        />
        <ToggleRow
          icon="accessibility-new"
          iconColor={theme.iconDefault}
          iconBackground={theme.grayTint}
          title="Accessibility Settings"
          description="Larger text and high contrast"
          value={accessibility}
          onValueChange={setAccessibility}
        />
      </SurfaceCard>

      <SurfaceCard>
        <NavRow
          icon="lock"
          iconColor={theme.greenIcon}
          iconBackground={theme.greenTint}
          title="Privacy Settings"
          subtitle="Manage data sharing & visibility"
          onPress={() => router.push('/privacy-policy')}
        />
        <View style={styles.divider} />
        <NavRow
          icon="shield"
          iconColor={theme.iconDefault}
          iconBackground={theme.grayTint}
          title="Change Password"
          subtitle="Update your account credentials"
        />
      </SurfaceCard>

      <Button label="Delete Account" variant="danger" icon="delete-outline" onPress={handleDeleteAccount} />

      <ThemedText style={styles.version}>Version 2.4.1 (Build 1092)</ThemedText>
    </ScreenContainer>
  );
}

const makeStyles = (theme: ThemePalette) =>
  StyleSheet.create({
    content: {
      padding: Spacing.md,
      gap: Spacing.md,
      backgroundColor: theme.screenBg,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    headerTitle: {
      fontSize: 20,
      color: theme.accent,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.xs,
    },
    divider: {
      height: 1,
      backgroundColor: theme.cardBorder,
    },
    version: {
      textAlign: 'center',
      fontSize: 12,
      color: theme.textMuted,
      marginTop: Spacing.sm,
    },
  });
