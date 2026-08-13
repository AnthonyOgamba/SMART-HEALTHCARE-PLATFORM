import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MyDaySummaryModal } from '@/components/my-day-summary-modal';
import { ErrorState, LoadingState, ScreenContainer } from '@/components/ui/screen-states';
import { SectionHeader } from '@/components/ui/section-header';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Radius, Spacing } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';
import { getHomeDashboard, type HomeDashboard } from '@/lib/services/home-dashboard';
import { recordMedicationSkipped, recordMedicationTaken } from '@/lib/services/medications';
import { canConfirmMedication } from '@/lib/care-action-windows';
import { useProfile } from '@/providers/profile-provider';
import { summarizeMyDay } from '@/lib/services/ai-care';
import { usePhoneActivity } from '@/hooks/use-phone-activity';
import { PhoneActivityPermissionModal } from '@/components/phone-activity-permission-modal';
import { healthService } from '@/lib/health/health-service';

const formatTime = (value: string) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
const formatDateTime = (value: string) => new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
const formatDuration = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

export default function DashboardScreen() {
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { profile } = useProfile();
  const loaded = useRef(false);
  const [data, setData] = useState<HomeDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [myDaySummary, setMyDaySummary] = useState<string>();
  const [summaryLoading, setSummaryLoading] = useState(false);
  const { snapshot: phoneActivity, availability: phoneAvailability, loading: phoneActivityLoading } = usePhoneActivity();
  const [showActivityPermission, setShowActivityPermission] = useState(false);

  const load = useCallback(async () => {
    if (loaded.current) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setData(await getHomeDashboard());
      loaded.current = true;
    } catch (loadError) {
      console.error('Could not load the Home dashboard.', loadError);
      setError('Some health information is temporarily unavailable.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (loading && !data) return <LoadingState label="Loading your health summary..." />;
  if (error && !data) return <ErrorState message={error} onRetry={() => void load()} />;

  const now = new Date();
  const currentHour = new Date().getHours();
  const dayPart = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';
  const firstName = profile?.full_name.trim().split(/\s+/)[0];
  const greeting = firstName ? `Good ${dayPart}, ${firstName}` : `Good ${dayPart}`;
  const appointment = data?.appointment;
  const nextMedication = data?.medications.next;
  const comingUp = [
    nextMedication && { key: nextMedication.logId, icon: 'medication' as const, title: `${nextMedication.name} · ${nextMedication.dose}`, detail: `Today at ${formatTime(nextMedication.scheduledFor)}`, startsAt: nextMedication.scheduledFor, route: '/(tabs)/appointments' },
    appointment && { key: appointment.id, icon: 'event' as const, title: appointment.title, detail: formatDateTime(appointment.startsAt), startsAt: appointment.startsAt, route: `/appointment-details?id=${appointment.id}` },
  ].filter((item): item is NonNullable<typeof item> => Boolean(item)).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()).slice(0, 4);
  const medicationCheckIn = async (status: 'taken' | 'skipped') => {
    if (!nextMedication) return;
    setCheckingIn(true);
    try { await (status === 'taken' ? recordMedicationTaken(nextMedication.logId) : recordMedicationSkipped(nextMedication.logId)); await load(); }
    catch { setError('Could not update the medication reminder.'); }
    finally { setCheckingIn(false); }
  };
  const summarizeDay = async () => { if(summaryLoading)return;setSummaryLoading(true);try { const result = await summarizeMyDay(); setMyDaySummary(result.summary); } catch { Alert.alert('Genie Cares Unavailable', 'Check Genie Cares settings and consent, then try again.'); } finally {setSummaryLoading(false);} };

  return (
    <ScreenContainer
      style={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load()} tintColor={theme.primary} />}
    >
      <View style={styles.header}>
        <View style={styles.grow}>
          <ThemedText style={styles.greeting}>{greeting}</ThemedText>
          <ThemedText style={styles.subtle}>{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(now)}</ThemedText>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => router.push('/notifications')} style={styles.iconButton}>
          <MaterialIcons name="notifications-none" size={25} color={theme.primary} />
          {(data?.notifications.unreadCount ?? 0) > 0 ? <View style={styles.badge}><ThemedText style={styles.badgeText}>{Math.min(data!.notifications.unreadCount, 99)}</ThemedText></View> : null}
        </Pressable>
      </View>

      {error ? <View accessibilityRole="alert" style={styles.notice}><ThemedText style={styles.noticeText}>{error} Pull down to try again.</ThemedText></View> : null}

      <SectionHeader label="TODAY AT A GLANCE" />
      <Pressable onPress={() => phoneAvailability === 'permission_required' ? setShowActivityPermission(true) : router.push('/device-activity' as never)}><SurfaceCard style={styles.deviceActivityCard}>
        <View style={styles.deviceActivityIcon}><MaterialIcons name="directions-walk" size={25} color={theme.primary} /></View>
        <View style={styles.grow}>
          <ThemedText style={styles.deviceActivityLabel}>TODAY&apos;S ACTIVITY</ThemedText>
          <ThemedText style={styles.deviceActivityValue}>{phoneActivityLoading ? 'Loading…' : phoneActivity?.steps === null || phoneActivity?.steps === undefined ? '—' : phoneActivity.steps.toLocaleString()}</ThemedText>
          <ThemedText style={styles.deviceActivityUnit}>Steps</ThemedText>
          <ThemedText style={styles.cardDetail}>{phoneAvailability === 'available' ? 'Source: This device' : phoneAvailability === 'permission_required' ? 'Tap to connect Phone Activity.' : 'Step tracking is not available on this device.'}</ThemedText>
        </View>
      </SurfaceCard></Pressable>
      <View style={styles.grid}>
        <SummaryCard icon="medication" label="Medications" value={data?.medications.progressPercentage === null ? 'No doses due yet' : `${data?.medications.takenDue ?? 0} of ${data?.medications.due ?? 0} due doses taken`} detail={(data?.medications.futureToday ?? 0) > 0 ? `${data!.medications.futureToday} scheduled later today` : 'No medications scheduled later today'} theme={theme} styles={styles} onPress={() => router.push('/(tabs)/appointments')} />
        <SummaryCard icon="event" label="Next appointment" value={appointment ? formatDateTime(appointment.startsAt) : 'No upcoming appointments'} theme={theme} styles={styles} onPress={() => router.push(appointment ? `/appointment-details?id=${appointment.id}` : '/add-appointment')} />
        <SummaryCard icon="directions-run" label="Activity" value={data?.activity.dailyGoalMinutes ? `${data.activity.completedMinutesToday} of ${data.activity.dailyGoalMinutes} min` : `${data?.activity.completedMinutesToday ?? 0} min completed`} detail={(data?.activity.recordedStepsToday ?? 0) > 0 ? `${data!.activity.recordedStepsToday.toLocaleString()} recorded steps` : undefined} theme={theme} styles={styles} onPress={() => router.push('/(tabs)/appointments')} />
        <SummaryCard icon="bedtime" label="Latest sleep" value={data?.sleep ? formatDuration(data.sleep.durationMinutes) : 'No sleep recorded yet'} theme={theme} styles={styles} onPress={() => router.push('/add-sleep')} />
      </View>

      <SurfaceCard>
        <SectionHeader label="NEEDS ATTENTION" />
        {data?.refills.mostUrgent ? <AttentionRow icon="inventory-2" text={`${data.refills.mostUrgent.name} may have ${data.refills.mostUrgent.estimatedDaysRemaining} days remaining`} onPress={() => router.push(`/medication-details?id=${data.refills.mostUrgent!.medicationId}`)} theme={theme} styles={styles} /> : null}
        {(data?.medications.overduePending ?? 0) > 0 ? <AttentionRow icon="schedule" text={`${data!.medications.overduePending} medication reminder${data!.medications.overduePending === 1 ? '' : 's'} overdue`} onPress={() => router.push('/(tabs)/appointments')} theme={theme} styles={styles} /> : null}
        {nextMedication && canConfirmMedication(nextMedication.scheduledFor) ? <View style={styles.checkInRow}><Pressable disabled={checkingIn} style={styles.checkInPrimary} onPress={() => void medicationCheckIn('taken')}><ThemedText style={styles.checkInPrimaryText}>Taken</ThemedText></Pressable><Pressable disabled={checkingIn} style={styles.checkInSecondary} onPress={() => void medicationCheckIn('skipped')}><ThemedText style={styles.checkInSecondaryText}>Skip</ThemedText></Pressable></View> : null}
        {(data?.notifications.unreadCount ?? 0) > 0 ? <AttentionRow icon="notifications" text={`${data!.notifications.unreadCount} unread notification${data!.notifications.unreadCount === 1 ? '' : 's'}`} onPress={() => router.push('/notifications')} theme={theme} styles={styles} /> : null}
        {!data?.refills.mostUrgent && !data?.medications.overduePending && !data?.notifications.unreadCount ? <ThemedText style={styles.subtle}>Nothing currently requires action in your recorded schedule.</ThemedText> : null}
      </SurfaceCard>

      <SectionHeader label="QUICK ADD" />
      <View style={styles.actions}>
        <QuickAction icon="medication" label="Medication" onPress={() => router.push('/add-medication')} theme={theme} styles={styles} />
        <QuickAction icon="event" label="Appointment" onPress={() => router.push('/add-appointment')} theme={theme} styles={styles} />
        <QuickAction icon="directions-run" label="Exercise" onPress={() => router.push('/add-activity')} theme={theme} styles={styles} />
        <QuickAction icon="bedtime" label="Sleep" onPress={() => router.push('/add-sleep')} theme={theme} styles={styles} />
      </View>

      <SurfaceCard>
        <View style={styles.sectionRow}><SectionHeader label="COMING UP" /><Pressable onPress={() => router.push('/(tabs)/appointments')}><ThemedText style={styles.link}>View full schedule</ThemedText></Pressable></View>
        {comingUp.length ? comingUp.map(item => <AttentionRow key={item.key} icon={item.icon} text={`${item.title} — ${item.detail}`} onPress={() => router.push(item.route as never)} theme={theme} styles={styles} />) : <ThemedText style={styles.subtle}>Nothing else scheduled for today.</ThemedText>}
      </SurfaceCard>

      <View style={styles.myDayCard}><View style={styles.myDayIcon}><MaterialIcons name="auto-awesome" size={24} color={theme.primary}/></View><View style={styles.grow}><ThemedText style={styles.myDayTitle}>My Day</ThemedText><ThemedText style={styles.myDaySubtitle}>Your AI-generated care summary</ThemedText><ThemedText style={styles.myDayDescription}>Get a quick overview of your medications, activities, sleep, and appointments.</ThemedText><Pressable disabled={summaryLoading} accessibilityRole="button" accessibilityLabel="View My Day Summary" onPress={()=>void summarizeDay()} style={styles.myDayButton}><ThemedText style={styles.myDayButtonText}>{summaryLoading?'Generating…':'View My Day Summary'}</ThemedText></Pressable></View></View>
      <MyDaySummaryModal visible={!!myDaySummary} summary={myDaySummary??''} onClose={()=>setMyDaySummary(undefined)} onFollowUp={()=>{setMyDaySummary(undefined);router.push('/(tabs)/assistant')}}/>
      <PhoneActivityPermissionModal visible={showActivityPermission} onClose={()=>setShowActivityPermission(false)} onAllow={()=>{setShowActivityPermission(false);void healthService.connectPhoneActivity();}} />
    </ScreenContainer>
  );
}

type DashboardStyles = ReturnType<typeof makeStyles>;
function SummaryCard({ icon, label, value, detail, onPress, theme, styles }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string; detail?: string; onPress: () => void; theme: ThemePalette; styles: DashboardStyles }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.summaryCard}><MaterialIcons name={icon} size={22} color={theme.primary} /><ThemedText style={styles.cardLabel}>{label}</ThemedText><ThemedText style={styles.cardValue}>{value}</ThemedText>{detail ? <ThemedText style={styles.cardDetail}>{detail}</ThemedText> : null}</Pressable>;
}
function QuickAction({ icon, label, onPress, theme, styles }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; onPress: () => void; theme: ThemePalette; styles: DashboardStyles }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Add ${label}`} onPress={onPress} style={styles.quickAction}><MaterialIcons name={icon} size={22} color={theme.primary} /><ThemedText style={styles.quickLabel}>{label}</ThemedText></Pressable>;
}
function AttentionRow({ icon, text, onPress, theme, styles }: { icon: keyof typeof MaterialIcons.glyphMap; text: string; onPress: () => void; theme: ThemePalette; styles: DashboardStyles }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.attentionRow}><MaterialIcons name={icon} size={20} color={theme.secondary} /><ThemedText style={styles.attentionText}>{text}</ThemedText><MaterialIcons name="chevron-right" size={20} color={theme.iconMuted} /></Pressable>;
}

const makeStyles = (theme: ThemePalette) => StyleSheet.create({
  content: { padding: Spacing.md, gap: Spacing.md, backgroundColor: theme.screenBg, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }, grow: { flex: 1 },
  greeting: { fontSize: 22, fontWeight: '700', color: theme.primary }, subtle: { color: theme.textSecondary, fontSize: 13, lineHeight: 19 },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.cardBg, borderWidth: 1, borderColor: theme.cardBorder },
  badge: { position: 'absolute', top: 1, right: 0, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: theme.danger, alignItems: 'center', justifyContent: 'center' }, badgeText: { color: theme.white, fontSize: 10, fontWeight: '700' },
  notice: { backgroundColor: theme.infoBoxBg, borderColor: theme.infoBoxBorder, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm }, noticeText: { color: theme.infoBoxText, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }, summaryCard: { width: '48%', minHeight: 130, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: theme.cardBorder, backgroundColor: theme.cardBg, gap: 5 },
  cardLabel: { color: theme.textSecondary, fontSize: 12 }, cardValue: { color: theme.textPrimary, fontWeight: '700', fontSize: 14 }, cardDetail: { color: theme.textMuted, fontSize: 11 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, link: { color: theme.secondary, fontWeight: '700', fontSize: 12 },
  attentionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.cardBorder }, attentionText: { flex: 1, color: theme.textPrimary, fontSize: 13 },
  checkInRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }, checkInPrimary: { flex: 1, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primary }, checkInPrimaryText: { color: theme.white, fontWeight: '700' }, checkInSecondary: { flex: 1, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.secondary }, checkInSecondaryText: { color: theme.secondary, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: Spacing.xs }, quickAction: { flex: 1, minHeight: 76, alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: Radius.md, backgroundColor: theme.selectedBackground }, quickLabel: { color: theme.primary, fontSize: 11, fontWeight: '700' },
  deviceActivityCard: { flexDirection: 'row', alignItems: 'center' }, deviceActivityIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.selectedBackground }, deviceActivityLabel: { color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 0.7 }, deviceActivityValue: { color: theme.primary, fontSize: 28, lineHeight: 33, fontWeight: '800' }, deviceActivityUnit: { color: theme.textPrimary, fontSize: 13, fontWeight: '700' },
  myDayCard:{flexDirection:'row',alignItems:'flex-start',gap:Spacing.md,padding:Spacing.lg,borderRadius:Radius.lg,backgroundColor:theme.selectedBackground,borderWidth:1,borderColor:theme.infoBoxBorder},myDayIcon:{width:46,height:46,borderRadius:23,alignItems:'center',justifyContent:'center',backgroundColor:theme.cardBg},myDayTitle:{fontSize:20,fontWeight:'800',color:theme.primary},myDaySubtitle:{fontSize:13,fontWeight:'700',color:theme.secondary},myDayDescription:{fontSize:13,lineHeight:19,color:theme.textSecondary,marginTop:4},myDayButton:{alignSelf:'flex-start',marginTop:12,minHeight:44,paddingHorizontal:16,borderRadius:12,backgroundColor:theme.primary,alignItems:'center',justifyContent:'center'},myDayButtonText:{color:theme.white,fontWeight:'800',fontSize:14},
});
