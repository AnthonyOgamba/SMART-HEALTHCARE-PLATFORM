import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { IconBadge } from '@/components/ui/icon-badge';
import { InfoField } from '@/components/ui/info-field';
import { Input } from '@/components/ui/input';
import { EmptyState, ErrorState, LoadingState, ScreenContainer } from '@/components/ui/screen-states';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';
import { signOut } from '@/lib/services/auth';
import type { Profile } from '@/lib/services/profile';
import { useAuth } from '@/providers/auth-provider';
import { useProfile } from '@/providers/profile-provider';

type EditableProfile = Pick<
  Profile,
  | 'full_name'
  | 'phone'
  | 'date_of_birth'
  | 'emergency_contact_name'
  | 'emergency_contact_relationship'
  | 'emergency_contact_phone'
>;

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading, error, refreshProfile, saveProfile } = useProfile();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [draft, setDraft] = useState<EditableProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!profile) return;
    setDraft({
      full_name: profile.full_name,
      phone: profile.phone,
      date_of_birth: profile.date_of_birth,
      emergency_contact_name: profile.emergency_contact_name,
      emergency_contact_relationship: profile.emergency_contact_relationship,
      emergency_contact_phone: profile.emergency_contact_phone,
    });
  }, [profile]);

  const setField = (key: keyof EditableProfile) => (value: string) => {
    setDraft((current) => (current ? { ...current, [key]: value || null } : current));
  };

  const save = async () => {
    if (!draft?.full_name.trim()) {
      Alert.alert('Full Name Required', 'Enter your full name before saving.');
      return;
    }
    setSaving(true);
    try {
      await saveProfile({ ...draft, full_name: draft.full_name.trim() });
      setEditing(false);
    } catch (saveError) {
      console.error('Failed to save the authenticated profile.', saveError);
      Alert.alert('Could Not Save Profile', 'Please check your information and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading profile..." />;
  if (error) return <ErrorState message={error} onRetry={refreshProfile} />;
  if (!profile || !draft) return <EmptyState message="No profile found." />;

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <ThemedText type="title" style={styles.headerTitle}>Profile Details</ThemedText>
        <View>
          <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
            <MaterialIcons name="settings" size={22} color={theme.iconDefault} />
          </Pressable>
        </View>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatarPlaceholder}>
          <MaterialIcons name="person" size={36} color={theme.avatarIcon} />
        </View>
        <ThemedText type="defaultSemiBold" style={styles.name}>{profile.full_name}</ThemedText>
        <ThemedText style={styles.email}>{user?.email ?? ''}</ThemedText>
      </View>

      {editing ? (
        <SurfaceCard>
          <Input label="Full Name" icon="person-outline" value={draft.full_name} onChangeText={setField('full_name')} />
          <Input label="Phone" icon="call" value={draft.phone ?? ''} onChangeText={setField('phone')} keyboardType="phone-pad" />
          <Input label="Date of Birth" icon="event" placeholder="YYYY-MM-DD" value={draft.date_of_birth ?? ''} onChangeText={setField('date_of_birth')} />
          <Input label="Emergency Contact" icon="shield" value={draft.emergency_contact_name ?? ''} onChangeText={setField('emergency_contact_name')} />
          <Input label="Relationship" icon="people" value={draft.emergency_contact_relationship ?? ''} onChangeText={setField('emergency_contact_relationship')} />
          <Input label="Emergency Phone" icon="call" value={draft.emergency_contact_phone ?? ''} onChangeText={setField('emergency_contact_phone')} keyboardType="phone-pad" />
          <Button label="Save Profile" icon="save" onPress={save} loading={saving} />
          <Button label="Cancel" variant="secondary" onPress={() => setEditing(false)} />
        </SurfaceCard>
      ) : (
        <>
          <SurfaceCard>
            <View style={styles.cardHeader}>
              <IconBadge icon="person-outline" color={theme.blueIcon} backgroundColor={theme.blueTint} size={30} />
              <ThemedText type="defaultSemiBold">Personal Information</ThemedText>
            </View>
            <InfoField label="FULL NAME" value={profile.full_name} />
            <InfoField label="EMAIL" value={user?.email ?? 'Not available'} />
            <InfoField label="PHONE" value={profile.phone ?? 'Not provided'} />
            <InfoField label="DATE OF BIRTH" value={profile.date_of_birth ?? 'Not provided'} />
          </SurfaceCard>
          <SurfaceCard>
            <View style={styles.cardHeader}>
              <IconBadge icon="shield" color={theme.greenIcon} backgroundColor={theme.greenTint} size={30} />
              <ThemedText type="defaultSemiBold">Emergency Contact</ThemedText>
            </View>
            <InfoField label="NAME" value={profile.emergency_contact_name ?? 'Not provided'} />
            <InfoField label="RELATIONSHIP" value={profile.emergency_contact_relationship ?? 'Not provided'} />
            <InfoField label="PHONE" value={profile.emergency_contact_phone ?? 'Not provided'} />
          </SurfaceCard>
          <Button label="Edit Profile" icon="edit" onPress={() => setEditing(true)} />
        </>
      )}

      <Button
        label="Logout"
        icon="logout"
        variant="danger"
        onPress={async () => {
          try {
            await signOut();
            router.replace('/');
          } catch (logoutError) {
            Alert.alert('Could Not Log Out', logoutError instanceof Error ? logoutError.message : 'Try again.');
          }
        }}
      />
      <ThemedText style={styles.version}>HealthNexus 1.0</ThemedText>
    </ScreenContainer>
  );
}

const makeStyles = (theme: ThemePalette) => StyleSheet.create({
  content: { padding: Spacing.md, gap: Spacing.md, backgroundColor: theme.screenBg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, color: theme.accent },
  avatarSection: { alignItems: 'center', gap: 2 },
  avatarPlaceholder: { width: 84, height: 84, borderRadius: 42, backgroundColor: theme.avatarBg, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 17, marginTop: Spacing.xs },
  email: { fontSize: 13, color: theme.textSecondary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  version: { textAlign: 'center', fontSize: 12, color: theme.textMuted, marginTop: Spacing.sm },
});
