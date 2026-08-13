import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DatePickerField } from '@/components/ui/date-picker-field';
import { ScreenContainer } from '@/components/ui/screen-states';
import { TimePickerField } from '@/components/ui/time-picker-field';
import { Brand } from '@/constants/theme';
import { createSleepLog, sleepDurationMinutes } from '@/lib/services/sleep';

function nextDate(date:string){const value=new Date(`${date}T12:00:00`);value.setDate(value.getDate()+1);return value.toISOString().slice(0,10)}

export default function AddSleep(){const router=useRouter(),params=useLocalSearchParams<{date?:string}>(),today=params.date??new Date().toISOString().slice(0,10),[startDate,setStartDate]=useState(today),[startTime,setStartTime]=useState('23:00'),[wakeDate,setWakeDate]=useState(nextDate(today)),[wakeTime,setWakeTime]=useState('07:00'),[quality,setQuality]=useState(''),[notes,setNotes]=useState('');const start=()=>new Date(`${startDate}T${startTime}:00`).toISOString(),wake=()=>new Date(`${wakeDate}T${wakeTime}:00`).toISOString();const save=async()=>{try{await createSleepLog({sleepStart:start(),wakeTime:wake(),quality:quality?Number(quality):null,notes});router.back()}catch{Alert.alert('Could Not Log Sleep','Wake time must follow sleep start.')}};let duration=0;try{duration=sleepDurationMinutes(start(),wake())}catch{}return <ScreenContainer contentContainerStyle={s.content}><View style={s.header}><Pressable accessibilityLabel="Go back" onPress={()=>router.back()}><MaterialIcons name="arrow-back" size={24} color={Brand.primary}/></Pressable><Text style={s.title}>Log Sleep</Text></View><DatePickerField label="Sleep start date" value={startDate} onChange={setStartDate}/><TimePickerField label="Sleep start time" value={startTime} onChange={setStartTime}/><DatePickerField label="Wake date" value={wakeDate} onChange={setWakeDate}/><TimePickerField label="Wake time" value={wakeTime} onChange={setWakeTime}/><Text>{duration?`${Math.floor(duration/60)}h ${duration%60}m`:'Enter a valid sleep period'}</Text><Field label="Sleep quality (1–5, optional)" value={quality} set={setQuality}/><Field label="Notes" value={notes} set={setNotes}/><Text style={s.note}>This is a manual record, not a medical measurement or diagnosis.</Text><Pressable style={s.save} onPress={save}><Text style={s.saveText}>Save Sleep</Text></Pressable></ScreenContainer>}

function Field({label,value,set}:{label:string;value:string;set:(value:string)=>void}){return <View><Text style={s.label}>{label}</Text><TextInput style={s.input} value={value} onChangeText={set}/></View>}

const s=StyleSheet.create({content:{padding:18,gap:14,backgroundColor:Brand.screenBg},header:{minHeight:44,flexDirection:'row',alignItems:'center',gap:12},title:{fontSize:26,fontWeight:'700',color:Brand.primary},label:{fontWeight:'600',color:Brand.textPrimary,marginBottom:4},input:{height:48,borderWidth:1,borderColor:Brand.inputBorder,borderRadius:10,padding:12,backgroundColor:'#FFF'},note:{color:Brand.textSecondary,fontSize:12},save:{padding:16,borderRadius:12,backgroundColor:Brand.primary,alignItems:'center'},saveText:{color:'#FFF',fontWeight:'700'}});
