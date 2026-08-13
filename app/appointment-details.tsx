import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ErrorState, LoadingState, ScreenContainer } from '@/components/ui/screen-states';
import { Brand } from '@/constants/theme';
import { canConfirmAppointment } from '@/lib/care-action-windows';
import { cancelAppointment, completeAppointment, confirmAppointmentAttendance, getAppointmentDetails } from '@/lib/services/appointments';
import { cancelAppointmentReminder } from '@/lib/services/local-appointment-reminders';
import { prepareForAppointment } from '@/lib/services/ai-care';
import type { CareAppointment } from '@/types';

export default function AppointmentDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [appointment, setAppointment] = useState<CareAppointment | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => { setError(''); getAppointmentDetails(id).then(setAppointment).catch(() => setError('Appointment not found.')); }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!appointment) return <LoadingState label="Loading appointment..." />;
  const action = async (kind: 'cancel' | 'complete' | 'confirm') => {
    try {
      if (kind === 'cancel') { await cancelAppointment(id); await cancelAppointmentReminder(id); }
      else if (kind === 'complete') await completeAppointment(id);
      else await confirmAppointmentAttendance(id);
      load();
    } catch { Alert.alert('Could Not Update Appointment', 'Please try again.'); }
  };
  const checkInAvailable = canConfirmAppointment(appointment.startsAt);
  const prepare = async () => { try { const result = await prepareForAppointment(id); Alert.alert('Appointment Preparation', result.summary); } catch { Alert.alert('Genie Cares Unavailable', 'Check Genie Cares settings and consent, then try again.'); } };
  return <ScreenContainer style={styles.content}>
    <View style={styles.header}><Pressable accessibilityLabel="Go back" onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={Brand.primary} /></Pressable><Text style={styles.title}>{appointment.title}</Text></View>
    <View style={styles.card}><Row label="Provider" value={appointment.providerName ?? 'Not specified'} /><Row label="Practitioner type" value={appointment.practitionerType ?? 'Not specified'} /><Row label="When" value={new Date(appointment.startsAt).toLocaleString()} /><Row label="Location" value={appointment.location ?? 'Not specified'} /><Row label="Status" value={appointment.status} /><Text style={styles.note}>This confirmation is for your personal Care Schedule. It does not contact or check you into a provider.</Text></View>
    {appointment.status === 'scheduled' ? <>
      <Pressable style={styles.primary} onPress={() => void prepare()}><Text style={styles.white}>Prepare with Genie Cares</Text></Pressable>
      <Pressable style={styles.primary} onPress={() => router.push({ pathname: '/add-appointment', params: { id } })}><Text style={styles.white}>Edit Appointment</Text></Pressable>
      {checkInAvailable && !appointment.attendanceConfirmedAt ? <Pressable style={styles.secondary} onPress={() => action('confirm')}><Text>I&apos;m Here</Text></Pressable> : null}
      {checkInAvailable ? <Pressable style={styles.secondary} onPress={() => action('complete')}><Text>Mark Completed</Text></Pressable> : <Text style={styles.note}>Check-in becomes available shortly before the appointment.</Text>}
      <Pressable style={styles.danger} onPress={() => Alert.alert('Cancel Appointment', 'Cancel this personal appointment record?', [{ text: 'Keep', style: 'cancel' }, { text: 'Cancel Appointment', style: 'destructive', onPress: () => action('cancel') }])}><Text style={styles.dangerText}>Cancel Appointment</Text></Pressable>
    </> : null}
  </ScreenContainer>;
}
function Row({ label, value }: { label: string; value: string }) { return <View><Text style={styles.label}>{label}</Text><Text>{value}</Text></View>; }
const styles = StyleSheet.create({ content: { padding: 18, gap: 14, backgroundColor: Brand.screenBg }, header: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12 }, title: { flex: 1, fontSize: 26, fontWeight: '700', color: Brand.primary }, card: { padding: 18, gap: 14, backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: Brand.cardBorder }, label: { fontSize: 11, color: Brand.textSecondary, fontWeight: '700' }, note: { fontSize: 12, color: Brand.textSecondary }, primary: { padding: 15, backgroundColor: Brand.primary, borderRadius: 12, alignItems: 'center' }, white: { color: '#FFF', fontWeight: '700' }, secondary: { padding: 14, borderWidth: 1, borderColor: Brand.inputBorder, borderRadius: 12, alignItems: 'center' }, danger: { padding: 14, alignItems: 'center' }, dangerText: { color: '#C62828', fontWeight: '700' } });
