import{supabase}from '@/lib/supabase/client';import type{InAppNotification}from '@/types';
const map=(x:any):InAppNotification=>({id:x.id,type:x.type,title:x.title,body:x.body,appointmentId:x.appointment_id,medicationLogId:x.medication_log_id,readAt:x.read_at,createdAt:x.created_at});
async function requireUserId(){const{data,error}=await supabase.auth.getUser();if(error)throw error;if(!data.user)throw new Error('Authentication is required to view notifications.');return data.user.id;}
export async function getNotifications(){const userId=await requireUserId();const{data,error}=await supabase.from('notifications' as any).select('*').eq('user_id',userId).order('created_at',{ascending:false}).limit(100);if(error)throw error;return(data??[]).map(map);}
export async function markNotificationRead(id:string){const{data,error}=await(supabase.rpc as any)('mark_notification_read',{p_id:id});if(error)throw error;return map(data);}
export async function markAllNotificationsRead(){const{error}=await(supabase.rpc as any)('mark_all_notifications_read',{});if(error)throw error;}
