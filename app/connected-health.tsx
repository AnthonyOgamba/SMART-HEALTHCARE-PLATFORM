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

export default function ConnectedHealth() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { snapshot, availability, refresh, connect } = usePhoneActivity();
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const phoneState = availability === 'available' ? 'Connected' : availability === 'permission_required' ? 'Permission Required' : availability === 'permission_denied' ? 'Not Connected' : 'Unavailable';

  return <ScreenContainer contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Pressable accessibilityLabel="Go back" onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={theme.primary} /></Pressable>
      <ThemedText style={styles.title}>Connected Health</ThemedText>
    </View>
    <ThemedText style={styles.subtitle}>Manage health and activity sources connected to Genie Cares.</ThemedText>
    <SurfaceCard>
      <View style={styles.row}><MaterialIcons name="directions-walk" size={28} color={theme.primary} /><View style={styles.flex}><ThemedText style={styles.cardTitle}>Phone Activity</ThemedText><ThemedText style={styles.subtitle}>Steps recorded by this device.</ThemedText></View><ThemedText style={styles.state}>{phoneState}</ThemedText></View>
      <ThemedText style={styles.value}>{snapshot?.steps == null ? '—' : `${snapshot.steps.toLocaleString()} steps today`}</ThemedText>
      <Pressable style={styles.action} onPress={() => availability === 'permission_required' ? setPermissionModalVisible(true) : availability === 'permission_denied' ? void Linking.openSettings() : void refresh()}><ThemedText style={styles.actionText}>{availability === 'available' ? 'Sync Now' : availability === 'permission_denied' ? 'Open Settings' : 'Connect'}</ThemedText></Pressable>
    </SurfaceCard>
    <SurfaceCard>
      <View style={styles.row}><MaterialIcons name="favorite" size={28} color={theme.primary} /><View style={styles.flex}><ThemedText style={styles.cardTitle}>Apple Health</ThemedText><ThemedText style={styles.subtitle}>Apple Watch and Apple Health data.</ThemedText></View><ThemedText style={styles.state}>Not Connected</ThemedText></View>
      <ThemedText style={styles.subtitle}>Native Apple Health integration is not installed yet.</ThemedText>
    </SurfaceCard>
    <PhoneActivityPermissionModal visible={permissionModalVisible} onClose={() => setPermissionModalVisible(false)} onAllow={() => { setPermissionModalVisible(false); void connect(); }} />
  </ScreenContainer>;
}

const makeStyles = (theme: ThemePalette) => StyleSheet.create({ content: { padding: 18, gap: 14, backgroundColor: theme.screenBg }, header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, title: { fontSize: 25, fontWeight: '800', color: theme.primary }, subtitle: { color: theme.textSecondary, lineHeight: 20 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, flex: { flex: 1 }, cardTitle: { fontSize: 17, fontWeight: '800', color: theme.textPrimary }, state: { color: theme.secondary, fontWeight: '800', fontSize: 12 }, value: { fontSize: 24, fontWeight: '800', color: theme.textPrimary }, action: { minHeight: 44, borderRadius: 11, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }, actionText: { color: theme.white, fontWeight: '800' } });
