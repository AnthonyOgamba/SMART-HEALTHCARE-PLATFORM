import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { DatePickerField } from '@/components/ui/date-picker-field';
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
import { useAppearance, type Appearance } from '@/providers/appearance-provider';
import { usePhoneActivity } from '@/hooks/use-phone-activity';

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
  const { appearance, setAppearance } = useAppearance();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [draft, setDraft] = useState<EditableProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { availability: phoneAvailability } = usePhoneActivity(false);
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
    if (saving) return;
    if (!draft?.full_name.trim()) {
      Alert.alert('Full Name Required', 'Enter your full name before saving.');
      return;
    }
    setSaving(true);
    try {
      await saveProfile({ ...draft, full_name: draft.full_name.trim() });
      await refreshProfile();
      setEditing(false);
    } catch (saveError) {
      console.error('Failed to save the authenticated profile.', saveError);
      Alert.alert('Could Not Save Profile', "We couldn't save your profile. Please try again.");
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
          <DatePickerField label="Date of Birth" value={draft.date_of_birth ?? ''} onChange={setField('date_of_birth')} optional />
          <Input label="Emergency Contact" icon="shield" value={draft.emergency_contact_name ?? ''} onChangeText={setField('emergency_contact_name')} />
          <Input label="Relationship" icon="people" value={draft.emergency_contact_relationship ?? ''} onChangeText={setField('emergency_contact_relationship')} />
          <Input label="Emergency Phone" icon="call" value={draft.emergency_contact_phone ?? ''} onChangeText={setField('emergency_contact_phone')} keyboardType="phone-pad" />
          <Button label="Save Profile" icon="save" onPress={save} loading={saving} disabled={saving} />
          <Button label="Cancel" variant="secondary" onPress={() => setEditing(false)} disabled={saving} />
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

      <Pressable onPress={() => router.push('/connected-health' as never)}><SurfaceCard>
        <View style={styles.connectedHeader}>
          <IconBadge icon="favorite" color={theme.blueIcon} backgroundColor={theme.blueTint} size={30} />
          <ThemedText type="defaultSemiBold">Connected Health</ThemedText>
          <ThemedText style={styles.manageLink}>Manage / See All</ThemedText>
        </View>
        <View style={styles.connectionRow}><View><ThemedText style={styles.connectionTitle}>Phone Activity</ThemedText><ThemedText style={styles.email}>Steps recorded by this phone</ThemedText></View><ThemedText style={styles.connectionState}>{phoneAvailability === 'available' ? 'Connected' : 'Unavailable'}</ThemedText></View>
        <View style={styles.connectionRow}><View><ThemedText style={styles.connectionTitle}>Apple Health</ThemedText><ThemedText style={styles.email}>Apple Watch and Health data</ThemedText></View><ThemedText style={styles.connectionPending}>Not Connected</ThemedText></View>
      </SurfaceCard></Pressable>

      <SurfaceCard>
        <View style={styles.cardHeader}>
          <IconBadge icon="palette" color={theme.blueIcon} backgroundColor={theme.blueTint} size={30} />
          <View><ThemedText type="defaultSemiBold">Appearance</ThemedText><ThemedText style={styles.email}>Applied across the whole app</ThemedText></View>
        </View>
        <View style={styles.appearanceRow}>
          {(['light', 'dark'] as Appearance[]).map(value => (
            <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: appearance === value }} style={[styles.appearanceOption, appearance === value && styles.appearanceSelected]} onPress={async () => {
              try { await setAppearance(value); }
              catch { Alert.alert('Could Not Save Appearance', 'Please try again.'); }
            }}>
              <MaterialIcons name={value === 'light' ? 'light-mode' : 'dark-mode'} size={20} color={appearance === value ? theme.white : theme.primary} />
              <ThemedText style={[styles.appearanceText, appearance === value && { color: theme.white }]}>{value === 'light' ? 'Light' : 'Dark'}</ThemedText>
            </Pressable>
          ))}
        </View>
      </SurfaceCard>

      <Button
        label="Logout"
        icon="logout"
        variant="danger"
        onPress={async () => {
          try {
            await signOut();
            // AuthProvider observes the cleared session and routes to Welcome.
          } catch (logoutError) {
            Alert.alert('Could Not Log Out', logoutError instanceof Error ? logoutError.message : 'Try again.');
          }
        }}
      />
      <ThemedText style={styles.version}>Genie Cares 1.0</ThemedText>
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
  connectedHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  manageLink: { marginLeft: 'auto', color: theme.primary, fontSize: 12, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 12, color: theme.textMuted, marginTop: Spacing.sm },
  appearanceRow: { flexDirection: 'row', gap: Spacing.sm },
  appearanceOption: { flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: theme.inputBorder, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  appearanceSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
  appearanceText: { color: theme.primary, fontWeight: '700' },
  connectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm, paddingVertical: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.cardBorder }, connectionTitle: { color: theme.textPrimary, fontWeight: '700' }, connectionState: { color: theme.successPillText, fontSize: 12, fontWeight: '700' }, connectionPending: { maxWidth: 125, color: theme.textSecondary, fontSize: 11, lineHeight: 15, textAlign: 'right', fontWeight: '700' },
});
