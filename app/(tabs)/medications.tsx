import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState, ScreenContainer } from '@/components/ui/screen-states';
import { Brand, PageTypography } from '@/constants/theme';
import { getMedicationsForDate, recordMedicationSkipped, recordMedicationTaken } from '@/lib/services/medications';
import type { MedicationDay, MedicationForDay, MedicationStatus } from '@/types';

const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export default function MedicationScreen() {
  const router = useRouter();
  const [data, setData] = useState<MedicationDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await getMedicationsForDate(localDate())); }
    catch { setError('Could not load today’s medications.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const record = async (item: MedicationForDay, status: 'taken' | 'skipped') => {
    setUpdating(item.log.id);
    try {
      if (status === 'taken') await recordMedicationTaken(item.log.id);
      else await recordMedicationSkipped(item.log.id);
      await load();
    } catch (mutationError) {
      Alert.alert('Could Not Update Dose', mutationError instanceof Error ? mutationError.message : 'Try again.');
    } finally { setUpdating(null); }
  };

  if (loading) return <LoadingState label="Loading medications..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  const items = data?.items ?? [];

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Medications</Text>
      <View style={styles.tabs}>
        <View style={styles.activeTab}><Text style={styles.activeTabText}>Today</Text></View>
        <Pressable style={styles.inactiveTab} onPress={() => router.push('/medication-history')}><Text>History</Text></Pressable>
      </View>
      <View style={styles.progressCard}>
        <Text style={styles.progressValue}>{data?.summary.taken ?? 0}/{data?.summary.scheduled ?? 0}</Text>
        <View><Text style={styles.progressTitle}>Daily Progress</Text><Text style={styles.muted}>medications taken today</Text></View>
      </View>
      {items.length === 0 ? <EmptyState message="No medications are scheduled for today." /> : items.map((item) => (
        <MedicationCard key={item.log.id} item={item} busy={updating === item.log.id} onRecord={record}
          onDetails={() => router.push({ pathname: '/medication-details', params: { id: item.medication.id } })} />
      ))}
      <Pressable style={styles.fab} onPress={() => router.push('/add-medication')}><MaterialIcons name="add" size={30} color="#FFF" /></Pressable>
    </ScreenContainer>
  );
}

function MedicationCard({ item, busy, onRecord, onDetails }: { item: MedicationForDay; busy: boolean; onRecord: (item: MedicationForDay, status: 'taken' | 'skipped') => void; onDetails: () => void }) {
  const time = new Date(item.log.scheduledFor).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return <View style={styles.card}>
    <View style={styles.cardTop}><View style={styles.icon}><MaterialIcons name="medication" size={24} color={Brand.accent} /></View>
      <View style={styles.flex}><Text style={styles.name}>{item.medication.name}</Text><Text style={styles.muted}>{item.medication.dose} • {time}</Text></View>
      <Status status={item.log.status} /></View>
    {item.log.status === 'pending' ? <View style={styles.actions}>
      <Pressable disabled={busy} style={styles.primary} onPress={() => onRecord(item, 'taken')}><Text style={styles.primaryText}>Mark Taken</Text></Pressable>
      <Pressable disabled={busy} style={styles.secondary} onPress={() => onRecord(item, 'skipped')}><Text style={styles.secondaryText}>Skip</Text></Pressable>
    </View> : null}
    <Pressable style={styles.details} onPress={onDetails}><Text style={styles.secondaryText}>Details</Text><MaterialIcons name="chevron-right" size={20} color={Brand.accent} /></Pressable>
  </View>;
}
function Status({ status }: { status: MedicationStatus }) { const colors = { pending:'#59616D',taken:'#00714D',skipped:'#B45309',missed:'#BA1A1A' }; return <Text style={[styles.status,{color:colors[status]}]}>{status.toUpperCase()}</Text>; }
const styles = StyleSheet.create({
  content:{padding:18,paddingBottom:120,gap:16,backgroundColor:Brand.screenBg}, title:{...PageTypography.title,color:Brand.accent},
  tabs:{flexDirection:'row',backgroundColor:'#E8EDF2',borderRadius:12,padding:4},activeTab:{flex:1,backgroundColor:'#FFF',padding:10,borderRadius:9,alignItems:'center'},inactiveTab:{flex:1,padding:10,alignItems:'center'},activeTabText:{color:Brand.accent,fontWeight:'700'},
  progressCard:{backgroundColor:Brand.accent,borderRadius:16,padding:18,flexDirection:'row',alignItems:'center',gap:16},progressValue:{color:'#FFF',fontSize:24,fontWeight:'700'},progressTitle:{color:'#FFF',fontSize:17,fontWeight:'700'},
  card:{backgroundColor:'#FFF',borderWidth:1,borderColor:Brand.cardBorder,borderRadius:16,padding:16,gap:14},cardTop:{flexDirection:'row',alignItems:'center',gap:12},icon:{width:44,height:44,borderRadius:12,backgroundColor:'#E6EEF9',alignItems:'center',justifyContent:'center'},flex:{flex:1},name:{fontSize:16,fontWeight:'700',color:Brand.textPrimary},muted:{fontSize:12,color:Brand.textSecondary},status:{fontSize:10,fontWeight:'700'},actions:{flexDirection:'row',gap:10},primary:{flex:1,backgroundColor:Brand.primary,borderRadius:10,padding:12,alignItems:'center'},primaryText:{color:'#FFF',fontWeight:'700'},secondary:{flex:1,borderWidth:1,borderColor:Brand.inputBorder,borderRadius:10,padding:12,alignItems:'center'},secondaryText:{color:Brand.accent,fontWeight:'700'},details:{flexDirection:'row',alignItems:'center',justifyContent:'flex-end'},fab:{position:'absolute',right:24,bottom:104,width:58,height:58,borderRadius:29,backgroundColor:Brand.primary,alignItems:'center',justifyContent:'center'}
});
