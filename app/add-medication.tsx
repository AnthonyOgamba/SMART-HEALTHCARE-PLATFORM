import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { LoadingState, ScreenContainer } from '@/components/ui/screen-states';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { TimePickerField } from '@/components/ui/time-picker-field';
import { Brand, PageTypography } from '@/constants/theme';
import {
  DEFAULT_MEDICATION_REMINDER_SOUND,
  MEDICATION_REMINDER_SOUNDS,
  type MedicationReminderSound,
} from '@/lib/notification-sounds';
import { cancelMedicationReminders, scheduleMedicationReminders } from '@/lib/services/local-medication-reminders';
import { createMedication, getMedicationDetails, updateMedication } from '@/lib/services/medications';
import { getUserSettings } from '@/lib/services/settings';
import type { MedicationSchedule } from '@/types';

const today = () => new Date().toISOString().slice(0, 10);
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export default function AddMedicationScreen() {
  const router = useRouter();
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const editing = Boolean(id);
  const [name,setName]=useState(''); const [dose,setDose]=useState(''); const [instructions,setInstructions]=useState('');
  const [startDate,setStartDate]=useState(date??today()); const [endDate,setEndDate]=useState('');
  const [times,setTimes]=useState(['08:00']);
  const [reminderSound,setReminderSound]=useState<MedicationReminderSound>(DEFAULT_MEDICATION_REMINDER_SOUND);
  const [reminders,setReminders]=useState(true); const [oldSchedules,setOldSchedules]=useState<MedicationSchedule[]>([]);
  const [loading,setLoading]=useState(Boolean(id)); const [submitting,setSubmitting]=useState(false); const [error,setError]=useState<string>();
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', []);

  useEffect(() => { if (!id) return; getMedicationDetails(id).then((value) => {
    setName(value.medication.name); setDose(value.medication.dose); setInstructions(value.medication.instructions ?? '');
    setStartDate(value.medication.startDate); setEndDate(value.medication.endDate ?? ''); setTimes(value.schedules.map((s)=>s.timeOfDay.slice(0,5))); setReminderSound(value.medication.reminderSound); setOldSchedules(value.schedules);
  }).catch(()=>setError('Could not load this medication.')).finally(()=>setLoading(false)); },[id]);

  const addTime=(value:string)=>{if(!TIME.test(value)){setError('Select a valid reminder time.');return;}if(times.includes(value)){setError('Reminder times must be unique.');return;}setTimes([...times,value].sort());setError(undefined);};
  const save=async()=>{
    const cleanName=name.trim(), cleanDose=dose.trim();
    if(!cleanName||!cleanDose){setError('Medication name and dose are required.');return;}
    if(!/^\d{4}-\d{2}-\d{2}$/.test(startDate)|| (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate))){setError('Dates must use YYYY-MM-DD.');return;}
    if(endDate && endDate<startDate){setError('End date cannot be before start date.');return;}
    if(times.length===0){setError('Add at least one reminder time.');return;}
    setSubmitting(true);setError(undefined);
    try{
      const input={name:cleanName,dose:cleanDose,instructions:instructions.trim()||null,startDate,endDate:endDate||null,scheduleTimes:times,timezone,reminderSound};
      const result=id?await updateMedication(id,input):await createMedication(input);
      try {
        if(id) await cancelMedicationReminders(oldSchedules.map((s)=>s.id));
        const settings=await getUserSettings();
        if(reminders && settings?.medication_reminders){ const granted=await scheduleMedicationReminders(result.medication,result.schedules); if(!granted) Alert.alert('Medication Saved','Device notification permission is disabled. Your medication was saved without local reminders.'); }
      } catch {
        Alert.alert('Medication Saved','Your medication was saved, but local reminders could not be updated. You can retry from Settings.');
      }
      router.replace('/(tabs)/appointments');
    }catch(saveError){setError(saveError instanceof Error?saveError.message:'Could not save medication.');}
    finally{setSubmitting(false);}
  };
  if(loading)return <LoadingState label="Loading medication..."/>;
  return <ScreenContainer contentContainerStyle={styles.content}>
    <View style={styles.header}><Pressable accessibilityLabel="Go back" hitSlop={10} onPress={()=>router.back()}><MaterialIcons name="arrow-back" size={24} color={Brand.primary}/></Pressable><Text style={styles.headerTitle}>{editing?'Edit Medication':'Add Medication'}</Text></View>
    <View style={styles.card}><Field label="Medication Name" value={name} onChange={setName} placeholder="e.g., Lisinopril"/><Field label="Dose" value={dose} onChange={setDose} placeholder="e.g., 10 mg"/><Field label="Instructions" value={instructions} onChange={setInstructions} placeholder="Optional instructions" multiline/><DatePickerField label="Start Date" value={startDate} onChange={setStartDate}/><DatePickerField label="End Date" value={endDate} onChange={setEndDate} optional/></View>
    <View style={styles.card}><Text style={styles.section}>Reminder Times</Text><TimePickerField label="Add reminder time" value="" onChange={addTime}/>
      <View style={styles.pills}>{times.map((time)=><View key={time} style={styles.pill}><Text>{time}</Text><Pressable onPress={()=>setTimes(times.filter((x)=>x!==time))}><MaterialIcons name="close" size={16} color={Brand.primary}/></Pressable></View>)}</View>
      <View><Text style={styles.label}>Reminder Sound</Text><Text style={styles.muted}>Custom sounds require an installed app build. Expo Go safely uses Default.</Text></View>
      <View style={styles.soundOptions}>{MEDICATION_REMINDER_SOUNDS.map((option)=><Pressable key={option.key} accessibilityRole="radio" accessibilityState={{checked:reminderSound===option.key}} style={[styles.soundOption,reminderSound===option.key&&styles.soundOptionSelected]} onPress={()=>setReminderSound(option.key)}><MaterialIcons name={reminderSound===option.key?'radio-button-checked':'radio-button-unchecked'} size={20} color={Brand.primary}/><Text style={styles.soundLabel}>{option.label}</Text></Pressable>)}</View>
      <View style={styles.switchRow}><View style={styles.flex}><Text style={styles.label}>Local Device Reminders</Text><Text style={styles.muted}>Uses the global medication reminder setting</Text></View><Switch value={reminders} onValueChange={setReminders}/></View></View>
    {error?<Text style={styles.error}>{error}</Text>:null}
    <Pressable disabled={submitting} style={[styles.save,submitting&&styles.disabled]} onPress={save}><Text style={styles.saveText}>{submitting?'Saving...':'Save Medication'}</Text></Pressable>
  </ScreenContainer>;
}
function Field({label,value,onChange,placeholder,multiline=false}:{label:string;value:string;onChange:(v:string)=>void;placeholder:string;multiline?:boolean}){return <View><Text style={styles.label}>{label}</Text><TextInput style={[styles.input,multiline&&styles.multiline]} value={value} onChangeText={onChange} placeholder={placeholder} multiline={multiline}/></View>;}
const styles=StyleSheet.create({content:{padding:18,paddingBottom:80,gap:16,backgroundColor:Brand.screenBg},header:{flexDirection:'row',alignItems:'center',gap:12},headerTitle:{...PageTypography.title,color:Brand.accent},card:{backgroundColor:'#FFF',borderWidth:1,borderColor:Brand.cardBorder,borderRadius:16,padding:18,gap:16},label:{color:Brand.textPrimary,fontWeight:'600',marginBottom:5},input:{height:48,borderWidth:1,borderColor:Brand.inputBorder,borderRadius:9,paddingHorizontal:13,color:Brand.textPrimary},multiline:{height:88,paddingTop:12},section:{fontSize:18,fontWeight:'700',color:Brand.accent},flex:{flex:1},pills:{flexDirection:'row',flexWrap:'wrap',gap:8},pill:{flexDirection:'row',alignItems:'center',gap:8,backgroundColor:'#E6EEF9',borderRadius:999,paddingHorizontal:12,paddingVertical:7},soundOptions:{gap:8},soundOption:{minHeight:44,flexDirection:'row',alignItems:'center',gap:10,borderWidth:1,borderColor:Brand.inputBorder,borderRadius:9,paddingHorizontal:12},soundOptionSelected:{borderColor:Brand.primary,backgroundColor:'#F2F7FD'},soundLabel:{color:Brand.textPrimary,fontWeight:'500'},switchRow:{flexDirection:'row',alignItems:'center'},muted:{color:Brand.textSecondary,fontSize:12},error:{color:'#C62828',fontWeight:'600'},save:{height:54,borderRadius:12,backgroundColor:Brand.primaryButtonBackground,alignItems:'center',justifyContent:'center'},saveText:{color:'#FFF',fontSize:17,fontWeight:'700'},disabled:{opacity:.55}});
