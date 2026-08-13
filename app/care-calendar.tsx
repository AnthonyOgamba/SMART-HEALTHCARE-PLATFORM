import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CareTokens } from '@/components/ui/care-schedule';
import { QuickAddSheet } from '@/components/ui/quick-add-sheet';
import { EmptyState, LoadingState, ScreenContainer } from '@/components/ui/screen-states';
import { getCareSchedule, localDate } from '@/lib/services/care-schedule';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';
import type { CareScheduleItem } from '@/types';

export default function Calendar() {
  const params = useLocalSearchParams<{ date?: string }>();
  const router = useRouter();
  const theme = usePalette();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [selected, setSelected] = useState(params.date ?? localDate());
  const [month, setMonth] = useState(() => new Date(`${params.date ?? localDate()}T12:00:00`));
  const [items, setItems] = useState<CareScheduleItem[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    let active = true;
    setItems(null);
    setLoadFailed(false);
    getCareSchedule(selected)
      .then((result) => { if (active) setItems(result.items); })
      .catch((error) => {
        if (__DEV__) console.debug('[CareCalendar] Day unavailable', error);
        if (active) { setItems([]); setLoadFailed(true); }
      });
    return () => { active = false; };
  }, [selected]);

  const days = useMemo(() => {
    const year = month.getFullYear(), monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const count = new Date(year, monthIndex + 1, 0).getDate();
    return [...Array(firstDay).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];
  }, [month]);

  const changeMonth = (offset: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1));
  const add = (kind: 'medication' | 'appointment' | 'activity' | 'sleep') => {
    setMenu(false);
    router.push({ pathname: ({ medication: '/add-medication', appointment: '/add-appointment', activity: '/add-activity', sleep: '/add-sleep' } as const)[kind], params: { date: selected } });
  };

  return <ScreenContainer contentContainerStyle={styles.content}>
    <View style={styles.header}><Pressable accessibilityLabel="Go back" style={styles.iconButton} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={theme.primary} /></Pressable><Text style={styles.title}>Care Calendar</Text></View>
    <View style={styles.calendarCard}>
      <View style={styles.month}><Pressable accessibilityLabel="Previous month" style={styles.iconButton} onPress={() => changeMonth(-1)}><MaterialIcons name="chevron-left" size={25} color={theme.primary} /></Pressable><Text style={styles.monthTitle}>{month.toLocaleDateString([], { month: 'long', year: 'numeric' })}</Text><Pressable accessibilityLabel="Next month" style={styles.iconButton} onPress={() => changeMonth(1)}><MaterialIcons name="chevron-right" size={25} color={theme.primary} /></Pressable></View>
      <View style={styles.week}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => <Text key={index} style={styles.weekText}>{label}</Text>)}</View>
      <View style={styles.grid}>{days.map((day, index) => {
        if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
        const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isSelected = selected === key;
        return <View key={key} style={styles.dayCell}><Pressable accessibilityState={{ selected: isSelected }} style={[styles.dayCircle, isSelected && styles.selectedDay]} onPress={() => setSelected(key)}><Text style={[styles.dayText, isSelected && styles.selectedText]}>{day}</Text><View style={[styles.dot, isSelected && styles.selectedDot]} /></Pressable></View>;
      })}</View>
    </View>
    <View style={styles.selectedHeader}><Text style={styles.section}>{new Date(`${selected}T12:00:00`).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</Text><Pressable onPress={() => setMenu(true)}><Text style={styles.add}>+ Add</Text></Pressable></View>
    {items === null ? <LoadingState label="Loading day..." /> : loadFailed ? <View accessibilityRole="alert" style={styles.errorCard}><Text style={styles.cardTitle}>Could not load this day.</Text><Text style={styles.muted}>Return to the schedule and try again.</Text></View> : items.length === 0 ? <EmptyState message="Nothing scheduled for this date." /> : <>{(['medication', 'appointment', 'activity', 'sleep'] as const).map((kind) => { const group = items.filter((item) => item.kind === kind); return group.length ? <View key={kind} style={styles.group}><Text style={styles.groupTitle}>{({ medication: 'MEDICATIONS', appointment: 'APPOINTMENTS', activity: 'ACTIVITY', sleep: 'SLEEP' } as const)[kind]}</Text>{group.map((item) => <Pressable key={item.id} style={styles.itemCard} onPress={()=>item.kind==='activity'?router.push({pathname:'/activity-details',params:{id:item.resourceId}}):undefined}><Text style={styles.time}>{new Date(item.startsAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text><View style={styles.itemText}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.muted}>{item.subtitle}</Text></View></Pressable>)}</View> : null; })}</>}
    <QuickAddSheet visible={menu} onClose={() => setMenu(false)} onSelect={add} />
  </ScreenContainer>;
}

const makeStyles = (theme: ThemePalette) => StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 20, gap: 16, backgroundColor: theme.screenBg },
  header: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 }, iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 25, fontWeight: '700', color: theme.primary }, calendarCard: { padding: 12, borderRadius: CareTokens.radius, borderWidth: 1, borderColor: theme.cardBorder, backgroundColor: theme.cardBg },
  month: { minHeight: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, monthTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: theme.primary },
  week: { flexDirection: 'row', marginTop: 4, marginBottom: 4 }, weekText: { width: '14.285%', textAlign: 'center', color: theme.textSecondary, fontWeight: '700' }, grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 2 },
  dayCell: { width: '14.285%', height: 44, alignItems: 'center', justifyContent: 'center' }, dayCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' }, selectedDay: { backgroundColor: theme.primary },
  dayText: { color: theme.textPrimary, lineHeight: 18 }, selectedText: { color: theme.white, fontWeight: '700' }, dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.iconMuted, marginTop: 2 }, selectedDot: { backgroundColor: theme.white },
  selectedHeader: { minHeight: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, section: { flex: 1, fontSize: 18, fontWeight: '700', color: theme.textPrimary }, add: { color: theme.secondary, fontWeight: '700' },
  group: { gap: 8 }, groupTitle: { fontSize: 11, fontWeight: '700', color: theme.textSecondary }, itemCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, backgroundColor: theme.cardBg, borderRadius: CareTokens.radius, borderWidth: 1, borderColor: theme.cardBorder }, time: { width: 62, fontWeight: '700', fontSize: 11, color: theme.textPrimary }, itemText: { flex: 1 }, cardTitle: { fontWeight: '700', color: theme.textPrimary }, muted: { color: theme.textSecondary, fontSize: 11 }, errorCard: { padding: 18, gap: 6, borderRadius: CareTokens.radius, backgroundColor: theme.cardBg, borderWidth: 1, borderColor: theme.cardBorder },
});
