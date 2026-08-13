import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { PhoneActivityPermissionModal } from '@/components/phone-activity-permission-modal';
import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ui/screen-states';
import { SurfaceCard } from '@/components/ui/surface-card';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';
import { usePhoneActivity } from '@/hooks/use-phone-activity';

export default function DeviceActivity() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { snapshot, availability, loading, refresh, connect } = usePhoneActivity();
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const hasSteps = snapshot?.steps !== null && snapshot?.steps !== undefined;

  const statusMessage = loading
    ? 'Loading today\'s step count…'
    : availability === 'permission_required'
      ? 'Connect Phone Activity to display your steps.'
      : availability === 'permission_denied'
        ? 'Motion & Fitness permission is disabled in device settings.'
        : availability === 'available' && !hasSteps
          ? 'No step reading is available yet. Try refreshing.'
          : availability === 'error'
            ? 'Your step count could not be loaded. Try again.'
            : availability === 'unavailable' || availability === 'unsupported'
              ? 'Step tracking is not available on this device.'
              : 'Source: This device';

  return <ScreenContainer contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Pressable accessibilityLabel="Go back" onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={theme.primary} /></Pressable>
      <ThemedText style={styles.title}>Activity &amp; Steps</ThemedText>
    </View>
    <SurfaceCard>
      <ThemedText style={styles.label}>TODAY</ThemedText>
      {hasSteps ? <><ThemedText style={styles.steps}>{snapshot.steps!.toLocaleString()}</ThemedText><ThemedText style={styles.unit}>Steps</ThemedText></> : <MaterialIcons name="directions-walk" size={50} color={theme.iconMuted} />}
      <ThemedText style={styles.muted}>{statusMessage}</ThemedText>
      {snapshot && hasSteps ? <ThemedText style={styles.muted}>Last updated {new Date(snapshot.capturedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</ThemedText> : null}
      {availability === 'permission_required' ? <Pressable style={styles.action} onPress={() => setPermissionModalVisible(true)}><ThemedText style={styles.actionText}>Connect Phone Activity</ThemedText></Pressable> : null}
      {availability === 'permission_denied' ? <Pressable style={styles.action} onPress={() => void Linking.openSettings()}><ThemedText style={styles.actionText}>Open Device Settings</ThemedText></Pressable> : null}
      {(availability === 'available' && !hasSteps) || availability === 'error' ? <Pressable style={styles.action} onPress={() => void refresh()}><ThemedText style={styles.actionText}>Refresh Steps</ThemedText></Pressable> : null}
    </SurfaceCard>
    <ThemedText style={styles.muted}>Step readings stay on this device. Walking distance and duration are not shown because the current source does not provide them reliably.</ThemedText>
    <PhoneActivityPermissionModal visible={permissionModalVisible} onClose={() => setPermissionModalVisible(false)} onAllow={() => { setPermissionModalVisible(false); void connect(); }} />
  </ScreenContainer>;
}

const makeStyles = (theme: ThemePalette) => StyleSheet.create({ content: { padding: 18, gap: 16, backgroundColor: theme.screenBg }, header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, title: { fontSize: 25, fontWeight: '800', color: theme.primary }, label: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: theme.textSecondary }, steps: { fontSize: 50, lineHeight: 58, fontWeight: '800', color: theme.primary }, unit: { fontSize: 18, fontWeight: '800', color: theme.textPrimary }, muted: { color: theme.textSecondary, lineHeight: 19 }, action: { marginTop: 8, minHeight: 46, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }, actionText: { color: theme.white, fontWeight: '800' } });
