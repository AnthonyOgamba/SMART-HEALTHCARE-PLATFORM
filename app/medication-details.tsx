import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ErrorState, LoadingState, ScreenContainer } from '@/components/ui/screen-states';
import { PageTypography } from '@/constants/theme';
import { usePalette, type ThemePalette } from '@/hooks/use-palette';
import { getMedicationReminderSound } from '@/lib/notification-sounds';
import { cancelMedicationReminders } from '@/lib/services/local-medication-reminders';
import { archiveMedication, getMedicationDetails } from '@/lib/services/medications';
import type { MedicationDetails } from '@/types';

export default function MedicationDetailsScreen(){
 const router=useRouter(),theme=usePalette(),styles=useMemo(()=>makeStyles(theme),[theme]); const {id}=useLocalSearchParams<{id:string}>(); const [data,setData]=useState<MedicationDetails|null>(null);const[loading,setLoading]=useState(true);const[error,setError]=useState<string>();
 const load=useCallback(async()=>{if(!id){setError('Medication was not found.');setLoading(false);return;}setLoading(true);try{setData(await getMedicationDetails(id));setError(undefined);}catch{setError('Could not load medication details.');}finally{setLoading(false);}},[id]);
 useFocusEffect(useCallback(()=>{load();},[load]));
 const archive=()=>Alert.alert('Remove Medication','Remove this medication from your active care schedule? Completed history will be preserved.',[{text:'Cancel',style:'cancel'},{text:'Remove',style:'destructive',onPress:async()=>{try{await archiveMedication(id);}catch(e){Alert.alert('Could Not Remove',e instanceof Error?e.message:'Try again.');return;}try{await cancelMedicationReminders(data?.schedules.map(s=>s.id)??[]);}catch{Alert.alert('Medication Removed','The medication was removed, but its local reminders could not be cleared. Disable medication reminders in Settings.');}router.replace('/(tabs)/appointments');}}]);
 if(loading)return <LoadingState label="Loading medication..."/>;if(error||!data)return <ErrorState message={error??'Medication was not found.'} onRetry={load}/>;
 const {medication:med,schedules,nextLog,adherence}=data;
 return <ScreenContainer contentContainerStyle={styles.content}><View style={styles.header}><Pressable onPress={()=>router.back()}><MaterialIcons name="arrow-back" size={24} color={theme.primary}/></Pressable><Text style={styles.title}>Medication Details</Text></View>
 <View style={styles.hero}><Text style={styles.active}>{med.active?'ACTIVE':'ARCHIVED'}</Text><Text style={styles.medName}>{med.name}</Text><Text style={styles.muted}>{med.dose}</Text></View>
 <View style={styles.card}><Row label="Instructions" value={med.instructions??'None provided'} styles={styles}/><Row label="Start Date" value={med.startDate} styles={styles}/><Row label="End Date" value={med.endDate??'Ongoing'} styles={styles}/><Row label="Reminder Times" value={schedules.map(s=>s.timeOfDay.slice(0,5)).join(', ')||'None'} styles={styles}/><Row label="Reminder Sound" value={getMedicationReminderSound(med.reminderSound).label} styles={styles}/><Row label="Next Dose" value={nextLog?new Date(nextLog.scheduledFor).toLocaleString():'No pending dose'} styles={styles}/></View>
 <View style={styles.card}><Text style={styles.section}>Recent Adherence</Text><Text style={styles.percent}>{adherence.percentage}%</Text><Text style={styles.muted}>{adherence.taken} taken • {adherence.skipped} skipped • {adherence.missed} missed</Text><Text style={styles.note}>Percentage = taken ÷ finalized doses. This describes logging consistency and is not medical advice.</Text></View>
 {med.active?<><Pressable style={styles.primary} onPress={()=>router.push({pathname:'/add-medication',params:{id:med.id}})}><Text style={styles.primaryText}>Edit Medication</Text></Pressable><Pressable style={styles.archive} onPress={archive}><MaterialIcons name="delete-outline" size={20} color={theme.danger}/><Text style={styles.archiveText}>Remove Medication</Text></Pressable></>:null}
 </ScreenContainer>;
}
function Row({label,value,styles}:{label:string;value:string;styles:ReturnType<typeof makeStyles>}){return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>;}
const makeStyles=(t:ThemePalette)=>StyleSheet.create({content:{padding:18,gap:16,backgroundColor:t.screenBg},header:{flexDirection:'row',alignItems:'center',gap:12},title:{...PageTypography.title,color:t.primary},hero:{backgroundColor:t.bannerBackground,borderRadius:16,padding:20},active:{color:'#D6E8FF',fontSize:10,fontWeight:'700'},medName:{color:t.white,fontSize:25,fontWeight:'700',marginTop:5},muted:{color:t.textSecondary,fontSize:13},card:{backgroundColor:t.cardBg,borderWidth:1,borderColor:t.cardBorder,borderRadius:16,padding:18,gap:14},row:{borderBottomWidth:1,borderBottomColor:t.cardBorder,paddingBottom:10},label:{fontSize:11,color:t.textSecondary,fontWeight:'700'},value:{fontSize:15,color:t.textPrimary,marginTop:3},section:{fontSize:18,fontWeight:'700',color:t.primary},percent:{fontSize:30,fontWeight:'700',color:t.primary},note:{fontSize:11,color:t.textSecondary,lineHeight:16},primary:{height:52,borderRadius:12,backgroundColor:t.primaryButtonBackground,alignItems:'center',justifyContent:'center'},primaryText:{color:t.white,fontWeight:'700'},archive:{height:50,borderWidth:1,borderColor:t.danger,borderRadius:12,flexDirection:'row',gap:8,alignItems:'center',justifyContent:'center'},archiveText:{color:t.danger,fontWeight:'700'}});
