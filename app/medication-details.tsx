import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ErrorState, LoadingState, ScreenContainer } from '@/components/ui/screen-states';
import { Brand, PageTypography } from '@/constants/theme';
import { getMedicationReminderSound } from '@/lib/notification-sounds';
import { cancelMedicationReminders } from '@/lib/services/local-medication-reminders';
import { archiveMedication, getMedicationDetails } from '@/lib/services/medications';
import type { MedicationDetails } from '@/types';

export default function MedicationDetailsScreen(){
 const router=useRouter(); const {id}=useLocalSearchParams<{id:string}>(); const [data,setData]=useState<MedicationDetails|null>(null);const[loading,setLoading]=useState(true);const[error,setError]=useState<string>();
 const load=useCallback(async()=>{if(!id){setError('Medication was not found.');setLoading(false);return;}setLoading(true);try{setData(await getMedicationDetails(id));setError(undefined);}catch{setError('Could not load medication details.');}finally{setLoading(false);}},[id]);
 useFocusEffect(useCallback(()=>{load();},[load]));
 const archive=()=>Alert.alert('Remove Medication','Archive this medication? Its history will be preserved.',[{text:'Cancel',style:'cancel'},{text:'Archive',style:'destructive',onPress:async()=>{try{await archiveMedication(id);}catch(e){Alert.alert('Could Not Archive',e instanceof Error?e.message:'Try again.');return;}try{await cancelMedicationReminders(data?.schedules.map(s=>s.id)??[]);}catch{Alert.alert('Medication Archived','The medication was archived, but its local reminders could not be cleared. Disable medication reminders in Settings.');}router.replace('/(tabs)/appointments');}}]);
 if(loading)return <LoadingState label="Loading medication..."/>;if(error||!data)return <ErrorState message={error??'Medication was not found.'} onRetry={load}/>;
 const {medication:med,schedules,nextLog,adherence}=data;
 return <ScreenContainer contentContainerStyle={styles.content}><View style={styles.header}><Pressable onPress={()=>router.back()}><MaterialIcons name="arrow-back" size={24} color={Brand.primary}/></Pressable><Text style={styles.title}>Medication Details</Text></View>
 <View style={styles.hero}><Text style={styles.active}>{med.active?'ACTIVE':'ARCHIVED'}</Text><Text style={styles.medName}>{med.name}</Text><Text style={styles.muted}>{med.dose}</Text></View>
 <View style={styles.card}><Row label="Instructions" value={med.instructions??'None provided'}/><Row label="Start Date" value={med.startDate}/><Row label="End Date" value={med.endDate??'Ongoing'}/><Row label="Reminder Times" value={schedules.map(s=>s.timeOfDay.slice(0,5)).join(', ')||'None'}/><Row label="Reminder Sound" value={getMedicationReminderSound(med.reminderSound).label}/><Row label="Next Dose" value={nextLog?new Date(nextLog.scheduledFor).toLocaleString():'No pending dose'}/></View>
 <View style={styles.card}><Text style={styles.section}>Recent Adherence</Text><Text style={styles.percent}>{adherence.percentage}%</Text><Text style={styles.muted}>{adherence.taken} taken • {adherence.skipped} skipped • {adherence.missed} missed</Text><Text style={styles.note}>Percentage = taken ÷ finalized doses. This describes logging consistency and is not medical advice.</Text></View>
 {med.active?<><Pressable style={styles.primary} onPress={()=>router.push({pathname:'/add-medication',params:{id:med.id}})}><Text style={styles.primaryText}>Edit Medication</Text></Pressable><Pressable style={styles.archive} onPress={archive}><MaterialIcons name="archive" size={20} color="#BA1A1A"/><Text style={styles.archiveText}>Remove Medication</Text></Pressable></>:null}
 </ScreenContainer>;
}
function Row({label,value}:{label:string;value:string}){return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>;}
const styles=StyleSheet.create({content:{padding:18,gap:16,backgroundColor:Brand.screenBg},header:{flexDirection:'row',alignItems:'center',gap:12},title:{...PageTypography.title,color:Brand.primary},hero:{backgroundColor:Brand.bannerBackground,borderRadius:16,padding:20},active:{color:'#D6E8FF',fontSize:10,fontWeight:'700'},medName:{color:'#FFF',fontSize:25,fontWeight:'700',marginTop:5},muted:{color:Brand.textSecondary,fontSize:13},card:{backgroundColor:'#FFF',borderWidth:1,borderColor:Brand.cardBorder,borderRadius:16,padding:18,gap:14},row:{borderBottomWidth:1,borderBottomColor:Brand.cardBorder,paddingBottom:10},label:{fontSize:11,color:Brand.textSecondary,fontWeight:'700'},value:{fontSize:15,color:Brand.textPrimary,marginTop:3},section:{fontSize:18,fontWeight:'700',color:Brand.primary},percent:{fontSize:30,fontWeight:'700',color:Brand.primary},note:{fontSize:11,color:Brand.textSecondary,lineHeight:16},primary:{height:52,borderRadius:12,backgroundColor:Brand.primaryButtonBackground,alignItems:'center',justifyContent:'center'},primaryText:{color:'#FFF',fontWeight:'700'},archive:{height:50,borderWidth:1,borderColor:'#E9B9B9',borderRadius:12,flexDirection:'row',gap:8,alignItems:'center',justifyContent:'center'},archiveText:{color:'#BA1A1A',fontWeight:'700'}});
