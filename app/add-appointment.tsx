import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ScreenContainer } from '@/components/ui/screen-states';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { TimePickerField } from '@/components/ui/time-picker-field';
import { Brand } from '@/constants/theme';
import { MEDICATION_REMINDER_SOUNDS, type MedicationReminderSound } from '@/lib/notification-sounds';
import { getAppointmentDetails, PRACTITIONER_TYPES, saveAppointment } from '@/lib/services/appointments';
import { cancelAppointmentReminder, scheduleAppointmentReminder } from '@/lib/services/local-appointment-reminders';
import { getUserSettings } from '@/lib/services/settings';

const OTHER_PRACTITIONER = 'Other healthcare practitioner';

export default function AddAppointment() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; date?: string }>();
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [practitioner, setPractitioner] = useState('Doctor');
  const [otherPractitioner, setOtherPractitioner] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(params.date ?? new Date().toISOString().slice(0, 10));
  const [start, setStart] = useState('10:00');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [reminder, setReminder] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState('60');
  const [sound, setSound] = useState<MedicationReminderSound>('default');

  useEffect(() => {
    if (!params.id) return;
    getAppointmentDetails(params.id).then((appointment) => {
      setTitle(appointment.title);
      setProvider(appointment.providerName ?? '');
      const savedType = appointment.practitionerType ?? 'Doctor';
      if (PRACTITIONER_TYPES.includes(savedType as (typeof PRACTITIONER_TYPES)[number])) {
        setPractitioner(savedType);
      } else {
        setPractitioner(OTHER_PRACTITIONER);
        setOtherPractitioner(savedType);
      }
      setReason(appointment.appointmentType ?? '');
      setDate(appointment.startsAt.slice(0, 10));
      setStart(new Date(appointment.startsAt).toTimeString().slice(0, 5));
      setEnd(appointment.endsAt ? new Date(appointment.endsAt).toTimeString().slice(0, 5) : '');
      setLocation(appointment.location ?? '');
      setNotes(appointment.notes ?? '');
      setSound(appointment.reminderSound);
      setReminder(Boolean(appointment.reminderAt));
    }).catch(() => Alert.alert('Could Not Load Appointment', 'Please try again.'));
  }, [params.id]);

  const save = async () => {
    const customPractitioner = otherPractitioner.trim();
    if (!title.trim()) return Alert.alert('Appointment Title Required', 'Enter an appointment title.');
    if (practitioner === OTHER_PRACTITIONER && !customPractitioner) {
      return Alert.alert('Practitioner Type Required', 'Please specify the practitioner type.');
    }
    try {
      const startsAt = new Date(`${date}T${start}:00`).toISOString();
      const endsAt = end ? new Date(`${date}T${end}:00`).toISOString() : null;
      if (endsAt && new Date(endsAt) <= new Date(startsAt)) throw new Error('End time must be after the start time.');
      const reminderAt = reminder
        ? new Date(new Date(startsAt).getTime() - Number(reminderMinutes) * 60_000).toISOString()
        : null;
      const appointment = await saveAppointment({
        title: title.trim(),
        providerName: provider.trim(),
        practitionerType: practitioner === OTHER_PRACTITIONER ? customPractitioner : practitioner,
        appointmentType: reason.trim(),
        location: location.trim(), startsAt, endsAt, notes: notes.trim(), reminderAt, reminderSound: sound,
      }, params.id);
      if (params.id) await cancelAppointmentReminder(params.id);
      const settings = await getUserSettings();
      if (reminder && settings?.appointment_reminders && !(await scheduleAppointmentReminder(appointment))) {
        Alert.alert('Appointment Saved', 'Notification permission is disabled; the appointment was saved without a local reminder.');
      }
      router.replace({ pathname: '/appointment-details', params: { id: appointment.id } });
    } catch (error) {
      Alert.alert('Could Not Save Appointment', error instanceof Error ? error.message : 'Check dates and required fields.');
    }
  };

  return <ScreenContainer contentContainerStyle={styles.content}>
    <View style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 }}><Pressable accessibilityLabel="Go back" hitSlop={10} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={Brand.primary} /></Pressable><Text style={styles.title}>{params.id ? 'Edit' : 'Add'} Appointment</Text></View>
    <Text style={styles.subtitle}>Add the details you need to keep this visit in your care schedule.</Text>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Appointment details</Text>
      <Field label="Appointment title" value={title} set={setTitle} />
      <Field label="Provider/practitioner name" value={provider} set={setProvider} />
      <Text style={styles.label}>Practitioner type</Text>
      <View style={styles.wrap}>{PRACTITIONER_TYPES.map((item) => <Pressable key={item} style={[styles.chip, item === practitioner && styles.selected]} onPress={() => setPractitioner(item)}><Text style={[styles.chipText, item === practitioner && styles.selectedText]}>{item}</Text></Pressable>)}</View>
      {practitioner === OTHER_PRACTITIONER ? <Field label="Please specify practitioner type" value={otherPractitioner} set={setOtherPractitioner} /> : null}
      <Field label="Appointment type/reason" value={reason} set={setReason} />
    </View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Date and location</Text>
      <DatePickerField label="Date" value={date} onChange={setDate} />
      <View style={styles.row}><View style={styles.flex}><TimePickerField label="Start time" value={start} onChange={setStart} /></View><View style={styles.flex}><TimePickerField label="End time (optional)" value={end} onChange={setEnd} optional /></View></View>
      <Field label="Location" value={location} set={setLocation} />
      <Field label="Notes" value={notes} set={setNotes} multiline />
    </View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Reminder</Text>
      <Pressable onPress={() => setReminder(!reminder)}><Text style={styles.toggle}>{reminder ? '✓ ' : ''}Reminder enabled</Text></Pressable>
      {reminder ? <><Field label="Minutes before" value={reminderMinutes} set={setReminderMinutes} /><Text style={styles.label}>Reminder sound</Text><View style={styles.wrap}>{MEDICATION_REMINDER_SOUNDS.map((item) => <Pressable key={item.key} style={[styles.chip, item.key === sound && styles.selected]} onPress={() => setSound(item.key)}><Text style={[styles.chipText, item.key === sound && styles.selectedText]}>{item.label}</Text></Pressable>)}</View></> : null}
    </View>
    <Text style={styles.note}>Saving this appointment does not book with the healthcare provider.</Text>
    <Pressable style={styles.save} onPress={save}><Text style={styles.saveText}>Save Appointment</Text></Pressable>
  </ScreenContainer>;
}

function Field({ label, value, set, multiline = false }: { label: string; value: string; set: (value: string) => void; multiline?: boolean }) {
  return <View><Text style={styles.label}>{label}</Text><TextInput style={[styles.input, multiline && styles.multiline]} value={value} onChangeText={set} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} /></View>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 36, gap: 16, backgroundColor: Brand.screenBg },
  title: { fontSize: 26, fontWeight: '700', color: Brand.primary }, subtitle: { color: Brand.textSecondary, lineHeight: 20 },
  section: { padding: 16, gap: 12, borderRadius: 14, borderWidth: 1, borderColor: Brand.cardBorder, backgroundColor: '#FFF' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Brand.textPrimary }, label: { fontWeight: '600', color: Brand.textPrimary, marginBottom: 6 },
  input: { minHeight: 48, borderWidth: 1, borderColor: Brand.inputBorder, borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#FFF', color: Brand.textPrimary }, multiline: { minHeight: 92, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 12 }, flex: { flex: 1 }, wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18, borderWidth: 1, borderColor: Brand.inputBorder, backgroundColor: '#FFF' }, selected: { backgroundColor: Brand.backgroundWash, borderColor: Brand.primary }, chipText: { color: Brand.textSecondary }, selectedText: { color: Brand.primary, fontWeight: '700' },
  toggle: { color: Brand.primary, fontWeight: '700', paddingVertical: 6 }, note: { fontSize: 12, color: Brand.textSecondary, lineHeight: 18 },
  save: { minHeight: 52, borderRadius: 12, backgroundColor: Brand.primaryButtonBackground, alignItems: 'center', justifyContent: 'center' }, saveText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
