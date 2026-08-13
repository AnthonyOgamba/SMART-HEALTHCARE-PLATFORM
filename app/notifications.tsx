import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState, LoadingState, ScreenContainer } from '@/components/ui/screen-states';
import { Brand } from '@/constants/theme';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/services/notifications';
import type { InAppNotification } from '@/types';

export default function Notifications(){
 const router=useRouter(),[data,setData]=useState<InAppNotification[]|null>(null),[error,setError]=useState('');
 const load=useCallback(async()=>{setError('');try{setData(await getNotifications());}catch(loadError){if(__DEV__)console.debug('[Notifications] Failed to load',{name:loadError instanceof Error?loadError.name:'UnknownError',message:loadError instanceof Error?loadError.message:'Unknown failure'});setError('Could not load notifications.');}},[]);
 useFocusEffect(useCallback(()=>{void load();},[load]));
 const goBack=()=>router.canGoBack()?router.back():router.replace('/(tabs)/home');
 const open=async(notification:InAppNotification)=>{if(!notification.readAt)await markNotificationRead(notification.id);if(notification.appointmentId)router.push({pathname:'/appointment-details',params:{id:notification.appointmentId}});else if(notification.medicationLogId)router.push('/(tabs)/appointments');else await load();};
 return <ScreenContainer contentContainerStyle={styles.content}><View style={styles.header}><View style={styles.headerLeft}><Pressable accessibilityLabel="Go back" hitSlop={10} onPress={goBack}><MaterialIcons name="arrow-back" size={24} color={Brand.primary}/></Pressable><Text style={styles.title}>Notifications</Text></View>{data?.length?<Pressable onPress={async()=>{await markAllNotificationsRead();await load();}}><Text style={styles.mark}>Mark all as read</Text></Pressable>:null}</View>
  {data===null&&!error?<LoadingState label="Loading notifications..."/>:error?<View accessibilityRole="alert" style={styles.error}><Text style={styles.errorTitle}>{error}</Text><Pressable style={styles.retry} onPress={load}><Text style={styles.retryText}>Try Again</Text></Pressable></View>:!data?.length?<EmptyState message="No notifications yet."/>:data.map(notification=><Pressable key={notification.id} style={[styles.card,!notification.readAt&&styles.unread]} onPress={()=>open(notification)}><View style={styles.flex}><Text style={styles.cardTitle}>{notification.title}</Text><Text style={styles.body}>{notification.body}</Text><Text style={styles.time}>{new Date(notification.createdAt).toLocaleString()}</Text></View>{!notification.readAt?<View style={styles.dot}/>:null}</Pressable>)}
 </ScreenContainer>;
}
const styles=StyleSheet.create({content:{paddingHorizontal:18,paddingTop:20,gap:12,backgroundColor:Brand.screenBg},header:{minHeight:48,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},headerLeft:{flexDirection:'row',alignItems:'center',gap:12},title:{fontSize:25,fontWeight:'700',color:Brand.primary},mark:{color:Brand.primary,fontWeight:'700',fontSize:12},card:{padding:15,flexDirection:'row',borderRadius:14,borderWidth:1,borderColor:Brand.cardBorder,backgroundColor:'#FFF'},unread:{borderColor:Brand.primary,backgroundColor:Brand.backgroundWash},flex:{flex:1},cardTitle:{fontWeight:'700',color:Brand.textPrimary},body:{color:Brand.textSecondary,marginTop:4},time:{fontSize:10,color:Brand.textMuted,marginTop:7},dot:{width:8,height:8,borderRadius:4,backgroundColor:Brand.primary},error:{padding:20,gap:12,backgroundColor:'#FFF',borderRadius:14,borderWidth:1,borderColor:Brand.cardBorder},errorTitle:{fontWeight:'700',color:Brand.textPrimary},retry:{alignSelf:'flex-start',paddingHorizontal:18,paddingVertical:10,borderRadius:9,backgroundColor:Brand.primary},retryText:{color:'#FFF',fontWeight:'700'}});
