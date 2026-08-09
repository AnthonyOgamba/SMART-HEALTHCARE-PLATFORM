import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { IconBadge } from '@/components/ui/icon-badge';
import { InfoField } from '@/components/ui/info-field';
import { EmptyState, ErrorState, LoadingState, ScreenContainer } from '@/components/ui/screen-states';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';
import { mockDelay, mockProfile } from '@/lib/api/mock';
import type { ProfileDetails } from '@/types';

async function loadProfile(): Promise<ProfileDetails> {
  // TODO: swap for `api.get<ProfileDetails>('/profile')` — likely owned by Member 1.
  return mockDelay(mockProfile);
}

export default function ProfileScreen() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    loadProfile()
      .then(setProfile)
      .catch(() => setError('Could not load your profile.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingState label="Loading profile…" />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!profile) return <EmptyState message="No profile found." />;

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <ThemedText type="title" style={styles.headerTitle}>
          Profile Details
        </ThemedText>
        <View style={styles.headerIcons}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            onPress={() => router.push('/settings')}
            hitSlop={8}>
            <MaterialIcons name="settings" size={22} color={theme.iconDefault} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => router.push('/notifications')}
            hitSlop={8}>
            <MaterialIcons name="notifications-none" size={22} color={theme.iconDefault} />
          </Pressable>
        </View>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarPlaceholder}>
            <MaterialIcons name="person" size={36} color={theme.avatarIcon} />
          </View>
          <Pressable style={styles.avatarEditBadge} accessibilityRole="button" accessibilityLabel="Edit photo">
            <MaterialIcons name="edit" size={14} color={theme.white} />
          </Pressable>
        </View>
        <ThemedText type="defaultSemiBold" style={styles.name}>
          {profile.fullName}
        </ThemedText>
        <ThemedText style={styles.email}>{profile.email}</ThemedText>
      </View>

      <SurfaceCard>
        <View style={styles.cardHeader}>
          <IconBadge icon="person-outline" color={theme.blueIcon} backgroundColor={theme.blueTint} size={30} />
          <ThemedText type="defaultSemiBold">Personal Information</ThemedText>
        </View>
        <InfoField label="FULL NAME" value={profile.fullName} />
        <InfoField label="EMAIL" value={profile.email} />
        <InfoField label="PHONE" value={profile.phone} />
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.cardHeader}>
          <IconBadge icon="shield" color={theme.greenIcon} backgroundColor={theme.greenTint} size={30} />
          <ThemedText type="defaultSemiBold">Emergency Contact</ThemedText>
        </View>
        <View style={styles.dualCol}>
          <InfoField label="NAME" value={profile.emergencyContact.name} style={{ flex: 1 }} />
          <InfoField label="RELATIONSHIP" value={profile.emergencyContact.relationship} style={{ flex: 1 }} />
        </View>
        <InfoField label="PHONE" value={profile.emergencyContact.phone} />
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.cardHeader}>
          <IconBadge icon="settings" color={theme.amberIcon} backgroundColor={theme.amberTint} size={30} />
          <ThemedText type="defaultSemiBold">Health Information</ThemedText>
        </View>
        <InfoField label="BLOOD TYPE" value={profile.healthInfo.bloodType} valueColor={theme.redIcon} />
        <InfoField label="ALLERGIES" value={profile.healthInfo.allergies} />
        <InfoField label="CHRONIC CONDITIONS" value={profile.healthInfo.chronicConditions} />
      </SurfaceCard>

      <Button label="Edit Profile" icon="edit" variant="primary" onPress={() => {}} />
      <Button
        label="Logout"
        icon="logout"
        variant="danger"
        onPress={() => {
          // TODO: Member 1 owns auth — clear the stored token via setAuthToken(null)
          // then redirect to login once that flow is wired up.
          router.replace('/');
        }}
      />

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
    headerIcons: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    headerTitle: {
      fontSize: 20,
      color: theme.accent,
    },
    avatarSection: {
      alignItems: 'center',
      gap: 2,
    },
    avatarWrap: {
      position: 'relative',
    },
    avatarPlaceholder: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: theme.avatarBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarEditBadge: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.cardBg,
    },
    name: {
      fontSize: 17,
      marginTop: Spacing.xs,
    },
    email: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.xs,
    },
    dualCol: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    version: {
      textAlign: 'center',
      fontSize: 12,
      color: theme.textMuted,
      marginTop: Spacing.sm,
    },
  });
