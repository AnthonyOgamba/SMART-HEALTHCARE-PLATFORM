import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState, ScreenContainer } from '@/components/ui/screen-states';
import { Brand, PageTypography } from '@/constants/theme';
import { getMedicationHistory } from '@/lib/services/medications';
import type { MedicationHistory } from '@/types';

const date=(value:Date)=>value.toISOString().slice(0,10);
export default function MedicationHistoryScreen(){const router=useRouter();const[data,setData]=useState<MedicationHistory|null>(null);const[loading,setLoading]=useState(true);const[error,setError]=useState<string>();
 const load=useCallback(async()=>{setLoading(true);const end=new Date(),start=new Date();start.setDate(start.getDate()-30);try{setData(await getMedicationHistory(date(start),date(end)));setError(undefined);}catch{setError('Could not load medication history.');}finally{setLoading(false);}},[]);useFocusEffect(useCallback(()=>{load();},[load]));
 if(loading)return <LoadingState label="Loading medication history..."/>;if(error)return <ErrorState message={error} onRetry={load}/>;
 return <ScreenContainer contentContainerStyle={styles.content}><View style={styles.header}><Pressable onPress={()=>router.back()}><MaterialIcons name="arrow-back" size={24} color={Brand.primary}/></Pressable><Text style={styles.title}>Medication History</Text></View>
 <View style={styles.summary}><Text style={styles.summaryLabel}>30-DAY ADHERENCE</Text><Text style={styles.percent}>{data?.summary.percentage??0}%</Text><Text style={styles.summaryText}>{data?.summary.taken??0} taken • {data?.summary.skipped??0} skipped • {data?.summary.missed??0} missed</Text><Text style={styles.note}>Taken ÷ finalized doses. This is a routine-tracking measure, not medical advice.</Text></View>
 {!data?.entries.length?<EmptyState message="No medication history for this period."/>:data.entries.map(entry=><View key={entry.id} style={styles.card}><View style={styles.icon}><MaterialIcons name={entry.status==='taken'?'check-circle':entry.status==='skipped'?'cancel':'warning'} size={23} color={entry.status==='taken'?'#00714D':entry.status==='skipped'?'#B45309':'#BA1A1A'}/></View><View style={styles.flex}><Text style={styles.name}>{entry.medicationName}</Text><Text style={styles.muted}>{entry.dose} • scheduled {new Date(entry.scheduledFor).toLocaleString()}</Text>{entry.recordedAt?<Text style={styles.recorded}>Recorded {new Date(entry.recordedAt).toLocaleString()}</Text>:null}</View><Text style={styles.status}>{entry.status.toUpperCase()}</Text></View>)}</ScreenContainer>;
}
const styles=StyleSheet.create({content:{padding:18,gap:14,backgroundColor:Brand.screenBg},header:{flexDirection:'row',alignItems:'center',gap:12},title:{...PageTypography.title,color:Brand.accent},summary:{backgroundColor:Brand.accent,borderRadius:16,padding:18},summaryLabel:{color:'#D5E8FF',fontSize:10,fontWeight:'700'},percent:{color:'#FFF',fontSize:30,fontWeight:'700'},summaryText:{color:'#FFF'},note:{color:'#D5E8FF',fontSize:10,marginTop:7},card:{backgroundColor:'#FFF',borderWidth:1,borderColor:Brand.cardBorder,borderRadius:14,padding:14,flexDirection:'row',alignItems:'center',gap:11},icon:{width:40,height:40,borderRadius:12,backgroundColor:'#EEF1F4',alignItems:'center',justifyContent:'center'},flex:{flex:1},name:{fontWeight:'700',color:Brand.textPrimary},muted:{fontSize:11,color:Brand.textSecondary,marginTop:2},recorded:{fontSize:10,color:Brand.textSecondary,marginTop:3},status:{fontSize:9,fontWeight:'700',color:Brand.accent}});
