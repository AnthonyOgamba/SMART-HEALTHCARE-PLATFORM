import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, type PropsWithChildren } from 'react';

export function NotificationNavigationProvider({children}:PropsWithChildren){const router=useRouter();useEffect(()=>{const open=(data:Record<string,unknown>)=>{if(typeof data.appointmentId==='string')router.push({pathname:'/appointment-details',params:{id:data.appointmentId}});else if(typeof data.medicationId==='string'||typeof data.scheduleId==='string')router.push('/(tabs)/appointments');};const response=Notifications.addNotificationResponseReceivedListener(value=>open(value.notification.request.content.data));void Notifications.getLastNotificationResponseAsync().then(value=>{if(value)open(value.notification.request.content.data)});return()=>response.remove();},[router]);return children;}
